export enum BenchmarkType {
    Cpu,
    IO
}

export enum BenchmarkStatus {
    Error,
    Success
}

export default class BenchmarkResult {
    type: BenchmarkType;
    status: BenchmarkStatus
}

export interface Benchmark {
    run(client: Client): Promise<BenchmarkResult>;
}