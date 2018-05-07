import {BenchmarkStatus, BenchmarkType, IBenchmarkResult} from "../IBenchmark";
import {IStorage} from "../IStorage";

const MDSCommon = require("mydataspace").MDSCommon;
const MDSClient = require("mydataspace").MDSClient;

interface IMdsStorageOptions {
    clientId: string;
    accessToken: string;
    root: string;
    path: string;
}

export default class MdsStorage implements IStorage {
    private options: IMdsStorageOptions;

    constructor(options: IMdsStorageOptions) {
        this.options = options;
    }

    public async store(provider: string, results: IBenchmarkResult[]): Promise<void> {
        const client = new MDSClient({
            clientId: this.options.clientId,
            permission: this.options.root,
        });

        await client.connect();

        await client.loginByToken(this.options.accessToken);

        for (const result of results) {
            const benchmarkType = BenchmarkType[result.type].toLowerCase();

            const fields =  [
                {name: "type", type: "s", value: benchmarkType},
                {name: "status", type: "s", value: BenchmarkStatus[result.status]},
                {name: "stdout", type: "j", value: result.stdout},
                {name: "location", type: "s", value: result.env.location},
                {name: "country", type: "s", value: result.env.country},
                {name: "city", type: "s", value: result.env.city},
                {name: "priceHourly", type: "r", value: result.env.priceHourly},
                {name: "priceMonthly", type: "r", value: result.env.priceMonthly},
                {name: "cores", type: "i", value: result.env.cores},
                {name: "memory", type: "i", value: result.env.memory},
                {name: "volumeSize", type: "i", value: result.env.volumeSize},
                {name: "volumeType", type: "i", value: result.env.volumeType},
                {name: "serverId", type: "s", value: result.env.id},
                {name: "benchmarkId", type: "s", value: result.benchmarkId},

            ];

            switch (result.type) {
                case BenchmarkType.Cpu:
                    break;
            }

            const entityName = MDSCommon.dateToString(new Date());

            await client.entities.create({
                fields,
                path: `${this.options.path}/${benchmarkType}/${provider}/${entityName}`,
                root: this.options.root,
            });

            await client.entities.change({
                fields,
                path: `${this.options.path}/${benchmarkType}/${provider}`,
                root: this.options.root,
            });
        }
    }
}
