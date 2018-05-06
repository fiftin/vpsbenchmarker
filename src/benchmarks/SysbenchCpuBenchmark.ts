import {BenchmarkResult, BenchmarkStatus, BenchmarkType, IBenchmark} from "../IBenchmark";
import Parsers from "../parsing/Parsers";

export default class SysbenchCpuBenchmark implements IBenchmark {
    private options: any;

    constructor(options: any) {
        this.options = options;
    }

    public async run(client: IClient): Promise<BenchmarkResult> {
        const ret = new BenchmarkResult();

        // await client.runCommand("sudo -s");
        await client.runCommand("apt update");
        await client.runCommand("apt install sysbench");

        ret.stdout = await client.runCommand(`sysbench --test=cpu --num-threads=${this.options.threads} run`);
        ret.type = BenchmarkType.Cpu;
        ret.status = BenchmarkStatus.Success;
        ret.state = Parsers.cpuSysbench.parse(ret.stdout);

        return ret;
    }
}
