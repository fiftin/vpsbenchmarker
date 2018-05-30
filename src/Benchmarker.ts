import {v4 as uuid} from "uuid";
import {IBenchmark, IBenchmarkResult} from "./IBenchmark";
import {IProvider, IServerOptions} from "./IProvider";

const logger = console;

export default class Benchmarker<T extends IServerOptions> {
    public static calcRating(results: IBenchmarkResult[]): number {
        let rating = 0;
        for (const benchmarkResult of results) {
            switch (benchmarkResult.benchmarkId) {
                case "sysbench-cpu-1core":
                case "sysbench-cpu-2cores":
                case "sysbench-cpu-4cores":
                case "sysbench-cpu-8cores":
                    rating += 1000 / benchmarkResult.metrics.get("totalTime");
                    break;
                case "sysbench-fileio-10g":
                case "sysbench-fileio-20g":
                case "sysbench-fileio-40g":
                    rating += 4000 / benchmarkResult.metrics.get("totalTime");
                    break;
            }
        }
        rating += 360;
        return rating;
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
                ret.push(result);
            }

            const rating = Benchmarker.calcRating(ret);

            ret.forEach((result) => result.rating = rating);

            return ret;
        } finally {
            logger.log(`Destroying server "${options.id}"...`);
            await this.provider.destroyServer(server);
        }
    }
}
