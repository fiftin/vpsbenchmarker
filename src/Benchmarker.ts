import {IBenchmark} from "./IBenchmark";
import Provider from "./Provider";

export default class Benchmarker {
    private readonly provider: Provider;
    private readonly benchmarks: IBenchmark[];

    constructor(provider: Provider, benchmarks: IBenchmark[]) {
        this.provider = provider;
        this.benchmarks = benchmarks;
    }

    public async start() {
        const server = await this.provider.createServer();
        try {
            const client = await server.connect();
            for (const benchmark of this.benchmarks) {
                const results = await benchmark.run(client);
            }
        } finally {
            await this.provider.destroyServer(server);
        }
    }
}