import {BenchmarkStatus, BenchmarkType, IBenchmark, IBenchmarkResult} from "../IBenchmark";
import Parsers from "../parsing/Parsers";
import SysbenchBenchmark from "./SysbenchBenchmark";

export default class SysbenchIOBenchmark extends SysbenchBenchmark {
    constructor(options: any) {
        super(options);
    }

    public async run(client: IClient): Promise<IBenchmarkResult> {
        await this.prepare(client);
        const command = `sysbench --test=fileio ${this.getArgsString()}`;
        await client.runCommand(`${command} prepare`);
        const stdout = await client.runCommand(`${command} run`);
        await client.runCommand(`${command} cleanup`);
        const metrics = Parsers.ioSysbench.parse(stdout);
        return {
            metrics,
            status: BenchmarkStatus.Success,
            stdout,
            type: BenchmarkType.IO,
        };
    }
}
