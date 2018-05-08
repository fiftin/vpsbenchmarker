import {IBenchmark, IBenchmarkResult} from "./IBenchmark";
import {IProvider, IServerOptions} from "./IProvider";

const logger = console;

export default class Benchmarker<T extends IServerOptions> {
    private readonly provider: IProvider<T>;
    private readonly benchmarks: IBenchmark[];

    constructor(provider: IProvider<T>, benchmarks: IBenchmark[]) {
        this.provider = provider;
        this.benchmarks = benchmarks;
    }

    public async start(options: T): Promise<IBenchmarkResult[]> {
        logger.log(`Creating server "${options.id}"...`);
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
                ret.push(result);
            }

            return ret;
        } finally {
            logger.log(`Destroying server "${options.id}"...`);
            await this.provider.destroyServer(server);
        }
    }
}
