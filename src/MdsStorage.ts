import {BenchmarkResult, IBenchmark} from "./IBenchmark";
import {IStorage} from "./IStorage";

const mds = require("mydataspace");

export default class MdsStorage implements IStorage {
    private options: any;
    constructor(options: any) {
        this.options = options;
    }

    public async store(provider: string, results: BenchmarkResult[]): Promise<void> {
        return null;
    }
}
