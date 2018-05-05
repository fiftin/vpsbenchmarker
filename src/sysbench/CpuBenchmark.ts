import {Benchmark, default as BenchmarkResult} from "../Benchmark";

export default class CpuBenchmark implements Benchmark {
    async run(): Promise<BenchmarkResult> {
        return null;
    }
}