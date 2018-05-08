import {BenchmarkStatus, BenchmarkType, IBenchmarkResult} from "../IBenchmark";
import Parsers from "../parsing/Parsers";
import SysbenchBenchmark from "./SysbenchBenchmark";

export default class SysbenchCpuBenchmark extends SysbenchBenchmark {
    constructor(options: any) {
        super(options);
    }

    public async run(client: IClient): Promise<IBenchmarkResult> {
        await this.prepare(client);
        const stdout = await client.runCommand(`sysbench --test=cpu ${this.getArgsString()} run`);
        const metrics = Parsers.cpuSysbench.parse(stdout);
        return {
            metrics,
            status: BenchmarkStatus.Success,
            stdout,
            type: BenchmarkType.Cpu,
        };
    }
}
