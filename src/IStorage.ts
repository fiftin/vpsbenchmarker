import {BenchmarkResult} from "./IBenchmark";

export interface IStorage {
    store(provider: string, results: BenchmarkResult[]): Promise<void>;
}
