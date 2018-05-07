import {IBenchmarkResult} from "./IBenchmark";

export interface IStorage {
    store(provider: string, results: IBenchmarkResult[]): Promise<void>;
}
