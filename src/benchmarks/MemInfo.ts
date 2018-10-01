import {BenchmarkStatus, BenchmarkType, IBenchmark, IBenchmarkResult} from "../IBenchmark";
import Parsers from "../parsing/Parsers";

export default class MemInfo implements IBenchmark {
    public async run(client: IClient): Promise<IBenchmarkResult> {
        const stdout = await client.runCommand(`cat /proc/meminfo`);
        const metrics = Parsers.memInfo.parse(stdout);
        return {
            metrics,
            status: BenchmarkStatus.Success,
            stdout,
            type: BenchmarkType.MemInfo,
        };
    }
}
