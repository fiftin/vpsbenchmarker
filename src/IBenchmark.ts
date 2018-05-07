import {IServerInfo} from "./IServer";

export enum BenchmarkType {
    Cpu,
    IO,
}

export enum BenchmarkStatus {
    Error,
    Success,
}

export interface IBenchmarkResult {
    benchmarkId?: string;
    type: BenchmarkType;
    status: BenchmarkStatus;
    stdout: string;
    env?: IServerInfo;
    cpu?: IBenchmarkCpuResult;
    io?: IBenchmarkIoResult;
}

export interface IBenchmarkIoResult {
    total: number;
}

export interface IBenchmarkCpuResult {
    totalTime: number;
    totalNumberOfEvents: number;
    numberOfThreads: number;
}

export interface IBenchmark {
    id?: string;
    run(client: IClient): Promise<IBenchmarkResult>;
}
