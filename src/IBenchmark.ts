export enum BenchmarkType {
    Cpu,
    IO,
}

export enum BenchmarkStatus {
    Error,
    Success,
}

export class BenchmarkResult {
    public type: BenchmarkType;
    public status: BenchmarkStatus;
    public stdout: string;
    public state: any;
}

export interface IBenchmark {
    run(client: IClient): Promise<BenchmarkResult>;
}
