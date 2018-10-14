import {BenchmarkStatus, BenchmarkType, IBenchmark, IBenchmarkResult} from "../IBenchmark";
import Parsers from "../parsing/Parsers";

export default class Iperf3Benchmark implements IBenchmark {
    protected readonly options: any;

    constructor(options: any) {
        this.options = options;
    }

    public async run(client: IClient): Promise<IBenchmarkResult> {
        await this.prepare(client);
        const stdout = await client.runCommand(`iperf3 -c ${this.options.host} ` +
            `-P ${this.options.threads} -t ${this.options.duration} | grep SUM`);
        const metrics = Parsers.networkIperf3.parse(stdout);
        return {
            metrics,
            status: BenchmarkStatus.Success,
            stdout,
            type: BenchmarkType.Network,
        };
    }

    protected async prepare(client: IClient): Promise<void> {
        const prefix = client.isRoot() ? "" : "sudo ";
        await client.runCommand(`${prefix}apt update`);
        await client.runCommand(`${prefix}apt install iperf3 -y`);
    }
}
