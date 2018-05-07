import {BenchmarkStatus, BenchmarkType, IBenchmark, IBenchmarkResult} from "../IBenchmark";
import Parsers from "../parsing/Parsers";

export default class SysbenchCpuBenchmark implements IBenchmark {
    private options: any;

    constructor(options: any) {
        this.options = options;
    }

    public async run(client: IClient): Promise<IBenchmarkResult> {
        // await client.runCommand("sudo -s");
        await client.runCommand("apt update");
        await client.runCommand("apt install sysbench -y");

        const stdout = await client.runCommand(`sysbench --test=cpu --num-threads=${this.options.threads} run`);

        const result = Parsers.cpuSysbench.parse(stdout);

        return {
            cpu: {
                numberOfThreads: result.numberOfThreads,
                totalNumberOfEvents: result.totalNumberOfEvents,
                totalTime: result.totalTime,
            },
            status: BenchmarkStatus.Success,
            stdout,
            type: BenchmarkType.Cpu,
        };
    }
}
