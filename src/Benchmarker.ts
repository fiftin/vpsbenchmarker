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
        logger.log(`Creating server "${options.name}"...`);
        const server = await this.provider.createServer(options);
        const serverInfo = await server.getInfo();
        try {
            logger.log(`Connecting to server "${options.name}"...`);
            const client = await server.connect();
            const ret = [];

            for (const benchmark of this.benchmarks) {
                logger.log(`Running benchmark "${benchmark.constructor.name}"...`);
                const results = await benchmark.run(client);
                results.env = serverInfo;
                ret.push(results);
            }

            return ret;
        } finally {
            logger.log(`Destroying server "${options.name}"...`);
            await this.provider.destroyServer(server);
        }
    }
}
