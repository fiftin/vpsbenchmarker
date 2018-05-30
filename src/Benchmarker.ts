import {v4 as uuid} from "uuid";
import {IBenchmark, IBenchmarkResult} from "./IBenchmark";
import {IProvider, IServerOptions} from "./IProvider";

const logger = console;

export default class Benchmarker<T extends IServerOptions> {
    public static calcRating(benchmarkResult: IBenchmarkResult): number {
        let rating: number;
        switch (benchmarkResult.benchmarkId) {
            case "sysbench-cpu-1core":
            case "sysbench-cpu-2cores":
            case "sysbench-cpu-4cores":
            case "sysbench-cpu-8cores":
                rating = 500 * benchmarkResult.metrics.get("totalNumberOfEvents") / 40000;
                break;
            case "sysbench-fileio-10g":
            case "sysbench-fileio-20g":
            case "sysbench-fileio-40g":
                rating = 500 * benchmarkResult.metrics.get("totalNumberOfEvents") / 400000;
                break;
            case "sysbench-memory":
                rating = 500 * benchmarkResult.metrics.get("totalNumberOfEvents") / 90000000;
                break;
            default:
                throw new Error(`Unknown benchmark ${benchmarkResult.benchmarkId}`);
        }
        return Math.floor(rating);
    }

    public static calcTotalRating(results: IBenchmarkResult[]): number {
        let cpuRating = 0;
        let memoryRating = 0;
        let fileioRating = 0;
        const networkRating = 800;
        const oltpRating = 1000;

        for (const benchmarkResult of results) {
            switch (benchmarkResult.benchmarkId) {
                case "sysbench-cpu-1core":
                case "sysbench-cpu-2cores":
                case "sysbench-cpu-4cores":
                case "sysbench-cpu-8cores":
                    if (!cpuRating) {
                        cpuRating = benchmarkResult.rating;
                    }
                    break;
                case "sysbench-fileio-10g":
                case "sysbench-fileio-20g":
                case "sysbench-fileio-40g":
                    if (!fileioRating) {
                        fileioRating = benchmarkResult.rating;
                    }
                    break;
                case "sysbench-memory":
                    if (!memoryRating) {
                        memoryRating = benchmarkResult.rating;
                    }
                    break;
            }
        }

        const diskSpaceRating = Math.floor(500 * results[0].env.volumeSize / 20);
        const memorySizeRating = Math.floor(500 * results[0].env.memory);
        const transferRating = Math.floor(200 * results[0].env.transfer / 5);

        return cpuRating +
            fileioRating + diskSpaceRating +
            memoryRating + memorySizeRating +
            networkRating + transferRating +
            oltpRating;
    }

    private readonly provider: IProvider<T>;
    private readonly benchmarks: IBenchmark[];

    constructor(provider: IProvider<T>, benchmarks: IBenchmark[]) {
        this.provider = provider;
        this.benchmarks = benchmarks;
    }

    public async start(options: T): Promise<IBenchmarkResult[]> {
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
