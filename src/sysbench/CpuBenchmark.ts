import {Benchmark, BenchmarkResult, BenchmarkStatus, BenchmarkType} from "../Benchmark";

export default class CpuBenchmark implements Benchmark {
    private _options: any;

    constructor(options: any) {
        this._options = options;
    }

    static parseResult(result: string): any {
        return {};
    }

    async run(client: IClient): Promise<BenchmarkResult> {
        const ret = new BenchmarkResult();

        await client.runCommand("sudo -s");
        await client.runCommand("apt update");
        await client.runCommand("apt install sysbench");

        ret.stdout = await client.runCommand(`sysbench --test=cpu --num-threads=${this._options.threads} run`);
        ret.type = BenchmarkType.Cpu;
        ret.status = BenchmarkStatus.Success;
        ret.state = CpuBenchmark.parseResult(ret.stdout);

        return ret;
    }
}