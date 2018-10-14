import {v4 as uuid} from "uuid";
import {IBenchmark, IBenchmarkResult} from "./IBenchmark";
import {IProvider, IServerOptions} from "./IProvider";

const logger = console;

export default class Benchmarker {
    public static calcRating(benchmarkResult: IBenchmarkResult): number {
        let rating: number;

        if (benchmarkResult.benchmarkId.startsWith("sysbench-")) {
            const totalMinutes = benchmarkResult.metrics.get("totalTime") / 60.0;
            const totalNumberOfEvents = benchmarkResult.metrics.get("totalNumberOfEvents");
            const eventsPerMinute = totalNumberOfEvents / totalMinutes;

            if (benchmarkResult.benchmarkId.startsWith("sysbench-cpu-")) {
                rating = 500 * eventsPerMinute / 40000;
            } else if (benchmarkResult.benchmarkId.startsWith("sysbench-fileio-")) {
                rating = 500 * eventsPerMinute / 400000;
            } else if (benchmarkResult.benchmarkId === "sysbench-memory") {
                rating = 500 * eventsPerMinute / 90000000;
            } else {
                rating = 0;
            }
        } else if (benchmarkResult.benchmarkId.startsWith("iperf3-")) {
            const bandwidth = benchmarkResult.metrics.get("networkBandwidth");
            rating = 500.0 * bandwidth / 20000000000.0;
        } else {
            rating = 0;
        }

        return Math.floor(rating);
    }

    public static calcRatingPerPrice(results: IBenchmarkResult[]): number {
        return 0;
    }

    public static calcTotalRating(results: IBenchmarkResult[]): number {
        let cpuRating = 0;
        let memoryRating = 0;
        let fileioRating = 0;
        let networkRating = 0;
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
            } else if (benchmarkResult.benchmarkId.startsWith("iperf3-")) {
                if (!networkRating) {
                    networkRating = benchmarkResult.rating;
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
