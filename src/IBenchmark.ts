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
    run(client: IClient): Promise<IBenchmarkResult>;
}
