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
    /**
     * Output of benchmark test.
     */
    public stdout: string;

}

export interface IBenchmark {
    run(client: IClient): Promise<BenchmarkResult>;
}
