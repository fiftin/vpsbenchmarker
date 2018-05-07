import {BenchmarkType, IBenchmarkResult} from "../IBenchmark";
import {IStorage} from "../IStorage";

const MDSCommon = require("mydataspace").MDSCommon;
const MDSClient = require("mydataspace").MDSClient;

interface IMdsStorageOptions {
    apiToken: string;
    root: string;
    path: string;
}

export default class MdsStorage implements IStorage {
    private options: IMdsStorageOptions;

    constructor(options: IMdsStorageOptions) {
        this.options = options;
    }

    public async store(provider: string, results: IBenchmarkResult[]): Promise<void> {
        const client = new MDSClient();

        await client.connect();

        await new Promise((resolve, reject) => {
            Mydataspace.on("login", resolve);
            Mydataspace.on("unauthorized", () => reject(new Error("MyDataSpace authorization error")));
        });

        for (const result of results) {
            const fields = [
                {name: "type", type: "s", value: result.type.toString().toLowerCase()},
                {name: "status", type: "s", value: result.status.toString().toLowerCase()},
                {name: "stdout", type: "s", value: result.stdout},
                {name: "location", type: "s", value: result.env.location},
                {name: "country", type: "s", value: result.env.country},
                {name: "city", type: "s", value: result.env.city},
            ];

            switch (result.type) {
                case BenchmarkType.Cpu:
                    break;
            }

            const entityName = MDSCommon.dateToString(new Date());

            await client.entities.create({
                fields,
                path: `${this.options.root}/${result.type}/${provider}/${entityName}`,
                root: this.options.root,
            });

            await client.entities.update({
                fields,
                path: `${this.options.root}/${result.type}/${provider}`,
                root: this.options.root,
            });
        }
    }
}
