import {IBenchmarkResult} from "./IBenchmark";

export interface IStorage {
    storeServerResults(serverId: string, results: IBenchmarkResult[]): Promise<void>;
}
