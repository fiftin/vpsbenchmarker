import {BenchmarkStatus, BenchmarkType, IBenchmarkResult} from "../IBenchmark";
import {IStorage} from "../IStorage";

const MDSCommon = require("mydataspace").MDSCommon;
const MDSClient = require("mydataspace").MDSClient;

interface IMdsStorageOptions {
    apiURL: string;
    accessToken: string;
    clientId: string;
    root: string;
    path: string;
    groupedResultsPath: string;
}

export default class MdsStorage implements IStorage {
    private options: IMdsStorageOptions;

    constructor(options: IMdsStorageOptions) {
        this.options = options;
    }

    public async storeServerResults(serverId: string, results: IBenchmarkResult[]): Promise<void> {
        const client = new MDSClient({
            apiURL: this.options.apiURL,
            clientId: this.options.clientId,
            permission: this.options.root,
            websocketURL: this.options.apiURL,
        });

        if (results.length === 0) {
            return;
        }

        await client.connect();

        await client.loginByToken(this.options.accessToken);

        await client.entities.change({
            fields: [{name: "rating", value: results[0].serverRating}],
            path: `website/servers/${results[0].env.id}`,
            root: this.options.root,
        });

        const entityName = MDSCommon.dateToString(new Date());

        await client.entities.create({
            fields: [
                {name: "serverId", value: serverId},
                {name: "rating", value: results[0].serverRating},
            ],
            path: `${this.options.groupedResultsPath}/${serverId}-${entityName}`,
            root: this.options.root,
        });

        for (const result of results) {
            const benchmarkType = BenchmarkType[result.type].toLowerCase();

            const fields =  [
                {name: "type",          type: "s", value: benchmarkType},
                {name: "status",        type: "s", value: BenchmarkStatus[result.status]},
                {name: "stdout",        type: "j", value: result.stdout},
                {name: "location",      type: "s", value: result.env.location},
                {name: "country",       type: "s", value: result.env.country},
                {name: "city",          type: "s", value: result.env.city},
                {name: "priceHourly",   type: "r", value: result.env.priceHourly},
                {name: "priceMonthly",  type: "r", value: result.env.priceMonthly},
                {name: "cores",         type: "i", value: result.env.cores},
                {name: "memory",        type: "r", value: result.env.memory},
                {name: "volumeSize",    type: "i", value: result.env.volumeSize},
                {name: "volumeType",    type: "s", value: result.env.volumeType},
                {name: "serverId",      type: "s", value: result.env.id},
                {name: "transfer",      type: "i", value: result.env.transfer},
                {name: "benchmarkId",   type: "s", value: result.benchmarkId},
                {name: "os",            type: "s", value: result.env.os},
                {name: "testId",        type: "s", value: result.testId},
                {name: "rating",        type: "i", value: result.rating},
                {name: "serverRating",  type: "i", value: result.serverRating},
            ];

            for (const [name, value] of result.metrics) {
                const type = typeof value === "string" ? "s" : "r";
                fields.push({name, type, value});
            }

            try {
                await client.entities.get({
                    path: `${this.options.path}/${result.benchmarkId}/${result.env.id}`,
                    root: this.options.root,
                });
            } catch (e) {
                await client.entities.create({
                    childPrototype: {
                        path: "protos/BenchmarkResult",
                        root: this.options.root,
                    },
                    path: `${this.options.path}/${result.benchmarkId}/${result.env.id}`,
                    root: this.options.root,
                });
            }

            await client.entities.create({
                fields,
                path: `${this.options.path}/${result.benchmarkId}/${result.env.id}/${entityName}`,
                root: this.options.root,
            });

            await client.entities.change({
                fields,
                path: `${this.options.path}/${result.benchmarkId}/${result.env.id}`,
                root: this.options.root,
            });

            const groupedResultsFields = [
                {name: "Benchmark", value: result.benchmarkId},
                {name: "Rating", value: result.rating},
                {name: "BenchmarkTotalNumberOfEvents", value: result.metrics.get("totalNumberOfEvents")},
                {name: "BenchmarkTotalTime", value: result.metrics.get("totalTime")},
            ];

            let groupedResultFieldPrefix;

            switch (result.type) {
                case BenchmarkType.Cpu:
                    groupedResultFieldPrefix = "cpu";
                    break;
                case BenchmarkType.IO:
                    groupedResultFieldPrefix = "fileio";
                    break;
                case BenchmarkType.Memory:
                    groupedResultFieldPrefix = "memory";
                    break;
                case BenchmarkType.Network:
                    groupedResultFieldPrefix = "network";
                    break;
                default:
                    groupedResultFieldPrefix = "unknown";
                    break;
            }

            for (const field of groupedResultsFields) {
                field.name = groupedResultFieldPrefix + field.name;
            }

            await client.entities.change({
                fields: groupedResultsFields,
                path: `${this.options.groupedResultsPath}/${serverId}-${entityName}`,
                root: this.options.root,
            });
        }
    }
}
