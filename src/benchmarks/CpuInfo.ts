import {BenchmarkStatus, BenchmarkType, IBenchmark, IBenchmarkResult} from "../IBenchmark";
import Parsers from "../parsing/Parsers";

export default class CpuInfo implements IBenchmark {
    public async run(client: IClient): Promise<IBenchmarkResult> {
        const stdout = await client.runCommand(`cat /proc/cpuinfo`);
        const metrics = Parsers.cpuInfo.parse(stdout);
        return {
            metrics,
            status: BenchmarkStatus.Success,
            stdout,
            type: BenchmarkType.CpuInfo,
        };
    }
}
