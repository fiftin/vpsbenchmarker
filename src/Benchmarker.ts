import Provider from "./Provider";
import {Benchmark} from "./Benchmark";

export default class Benchmarker {
    private readonly _provider: Provider;
    private readonly _benchmarks: Benchmark[];

    constructor(provider: Provider, benchmarks: Benchmark[]) {
        this._provider = provider;
        this._benchmarks = benchmarks;
    }

    async start() {
        const server = await this._provider.createServer();
        try {
            const client = await server.connect();
            for (const benchmark of this._benchmarks) {
                const results = await benchmark.run(client);
            }
        } finally {
            await this._provider.destroyServer(server);
        }
    }
}