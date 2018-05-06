import {BenchmarkResult, IBenchmark} from "./IBenchmark";

export default class Benchmarker<TServerOptions> {
    private readonly provider: IProvider<TServerOptions>;
    private readonly benchmarks: IBenchmark[];

    constructor(provider: IProvider<TServerOptions>, benchmarks: IBenchmark[]) {
        this.provider = provider;
        this.benchmarks = benchmarks;
    }

    public async start(options: TServerOptions): Promise<BenchmarkResult[]> {
        const server = await this.provider.createServer(options);
        try {
            const client = await server.connect();
            const ret = [];

            for (const benchmark of this.benchmarks) {
                const results = await benchmark.run(client);
                ret.push(results);
            }

            return ret;
        } finally {
            await this.provider.destroyServer(server);
        }
    }
}
