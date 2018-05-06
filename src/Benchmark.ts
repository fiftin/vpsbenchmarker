export enum BenchmarkType {
    Cpu,
    IO
}

export enum BenchmarkStatus {
    Error,
    Success
}

export class BenchmarkResult {
    type: BenchmarkType;
    status: BenchmarkStatus;
    stdout: string;
    state: any
}

export interface Benchmark {
    run(client: IClient): Promise<BenchmarkResult>;
}