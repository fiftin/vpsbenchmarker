import {v4 as uuid} from "uuid";
import {IBenchmark, IBenchmarkResult} from "./IBenchmark";
import {IProvider, IServerOptions} from "./IProvider";

const logger = console;

export default class Benchmarker {
    public static calcRating(benchmarkResult: IBenchmarkResult): number {
        let rating: number;
        if (benchmarkResult.benchmarkId.startsWith("sysbench-cpu-")) {
            rating = 500 * benchmarkResult.metrics.get("totalNumberOfEvents") / 40000;
        } else if (benchmarkResult.benchmarkId.startsWith("sysbench-fileio-")) {
            rating = 500 * benchmarkResult.metrics.get("totalNumberOfEvents") / 400000;
        } else if (benchmarkResult.benchmarkId === "sysbench-memory") {
            rating = 500 * benchmarkResult.metrics.get("totalNumberOfEvents") / 90000000;
        } else {
            throw new Error(`Unknown benchmark ${benchmarkResult.benchmarkId}`);
        }
        return Math.floor(rating);
    }

    public static calcTotalRating(results: IBenchmarkResult[]): number {
        let cpuRating = 0;
        let memoryRating = 0;
        let fileioRating = 0;
        const networkRating = 500;
        const oltpRating = 1000;

        for (const benchmarkResult of results) {
            if (benchmarkResult.benchmarkId.startsWith("sysbench-cpu-")) {
                if (!cpuRating) {
                    cpuRating = benchmarkResult.rating;
                }
            } else if (benchmarkResult.benchmarkId.startsWith("sysbench-fileio-")) {
                if (!fileioRating) {
                    fileioRating = benchmarkResult.rating;
                }
            } else if (benchmarkResult.benchmarkId === "sysbench-memory") {
                if (!memoryRating) {
                    memoryRating = benchmarkResult.rating;
                }
            }
        }

        const diskSpaceFactor = Math.log(results[0].env.volumeSize / 10) || 0;
        let memorySizeFactor = Math.log(results[0].env.memory * 1.5) || 0;
        let transferFactor = results[0].env.transfer ? Math.log(results[0].env.transfer * 2) : 0;

        if (memorySizeFactor === -Infinity || isNaN(memorySizeFactor) || memorySizeFactor < 0) {
            memorySizeFactor = 0;
        }

        if (transferFactor === -Infinity || transferFactor < 0) {
            transferFactor = 0;
        }

        return Math.round(cpuRating +
            fileioRating * diskSpaceFactor +
            memoryRating * memorySizeFactor +
            networkRating + 200 * transferFactor +
            oltpRating);
    }

    private readonly provider: IProvider;
    private readonly benchmarks: IBenchmark[];

    constructor(provider: IProvider, benchmarks: IBenchmark[]) {
        this.provider = provider;
        this.benchmarks = benchmarks;
    }

    public async start(options: IServerOptions): Promise<IBenchmarkResult[]> {
        logger.log(`Creating server "${options.id}"...`);
        const testId = uuid();
        const server = await this.provider.createServer(options);
        const serverInfo = await server.getInfo();
        try {
            logger.log(`Connecting to server "${options.id}"...`);
            const client = await server.connect();
            const ret = [];

            for (const benchmark of this.benchmarks) {
                logger.log(`Running benchmark "${benchmark.constructor.name}"...`);
                const result = await benchmark.run(client);
                result.env = serverInfo;
                result.benchmarkId = benchmark.id;
                result.testId = testId;
                result.rating = Benchmarker.calcRating(result);
                ret.push(result);
                await new Promise((resolve) => setTimeout(resolve, 20000));
            }

            const rating = Benchmarker.calcTotalRating(ret);

            ret.forEach((result) => result.serverRating = rating);

            return ret;
        } finally {
            logger.log(`Destroying server "${options.id}"...`);
            await this.provider.destroyServer(server);
        }
    }
}
