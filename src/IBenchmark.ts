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
    testId?: string;
    rating?: number;
    serverRating?: number;
    type: BenchmarkType;
    status: BenchmarkStatus;
    stdout: string;
    metrics: Map<string, any>;
    env?: IServerInfo;
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
