import {BenchmarkResult, IBenchmark} from "./IBenchmark";

export default class Benchmarker {
    private readonly provider: IProvider;
    private readonly benchmarks: IBenchmark[];

    constructor(provider: IProvider, benchmarks: IBenchmark[]) {
        this.provider = provider;
        this.benchmarks = benchmarks;
    }

    public async start(): Promise<BenchmarkResult[]> {
        const server = await this.provider.createServer();
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
