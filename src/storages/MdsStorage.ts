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
                if (typeof value === "object") {
                    continue;
                }
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

            for (const [name, value] of result.metrics) {
                if (typeof value !== "object") {
                    continue;
                }

                await client.entities.create({
                    fields: Array.isArray(value) ? [] : MDSCommon.convertMapToNameValue(value, true),
                    path: `${this.options.path}/${result.benchmarkId}/${result.env.id}/${entityName}/${name}`,
                    root: this.options.root,
                });

                if (Array.isArray(value)) {
                    const entities = value.map((item, i) => ({
                        fields: MDSCommon.convertMapToNameValue(item, true),
                        path: `${this.options.path}/${result.benchmarkId}/${result.env.id}/${entityName}/${name}/${i}`,
                        root: this.options.root,
                    }));

                    await client.entities.create(entities);
                }
            }

            await client.entities.change({
                fields,
                path: `${this.options.path}/${result.benchmarkId}/${result.env.id}`,
                root: this.options.root,
            });

            const serverFields = {};

            let groupedResultsFields = [];

            if ([BenchmarkType.Cpu,
                BenchmarkType.IO,
                BenchmarkType.Memory].indexOf(result.type) >= 0) {
                groupedResultsFields = [
                    {name: "Benchmark", value: result.benchmarkId},
                    {name: "Rating", value: result.rating},
                    {name: "BenchmarkTotalNumberOfEvents", value: result.metrics.get("totalNumberOfEvents")},
                    {name: "BenchmarkTotalTime", value: result.metrics.get("totalTime")},
                    {name: "BenchmarkNumberOfThreads", value: result.metrics.get("numberOfThreads")},
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
                    default:
                        groupedResultFieldPrefix = "unknown";
                        break;
                }

                for (const field of groupedResultsFields) {
                    field.name = groupedResultFieldPrefix + field.name;
                }

                serverFields[groupedResultFieldPrefix + "Rating"] = result.rating;
            } else if (result.type === BenchmarkType.Network) {
                groupedResultsFields.push(...[
                    {name: "networkBenchmark", value: result.benchmarkId},
                    {name: "networkRating", value: result.rating},
                    {name: "networkBandwidth", value: result.metrics.get("networkBandwidth")},
                ]);
                serverFields["networkRating"] = result.rating;
                serverFields["networkBandwidth"] = result.metrics.get("networkBandwidth");
            } else {
                for (const entry of result.metrics.entries()) {
                    groupedResultsFields.push({
                        name: BenchmarkType[result.type] + "_" + entry[0],
                        value: entry[1],
                    });
                }
                if (result.type === BenchmarkType.CpuInfo) {
                    serverFields["CpuInfo_modelName"] = this.humanizeCpuModelName(result.metrics.get("modelName"));
                    serverFields["CpuInfocpuMhz"] = result.metrics.get("cpuMhz");
                }
            }

            await client.entities.change({
                fields: groupedResultsFields,
                path: `${this.options.groupedResultsPath}/${serverId}-${entityName}`,
                root: this.options.root,
            });

            await client.entities.change({
                fields: MDSCommon.convertMapToNameValue(serverFields),
                path: `website/servers/${serverId}`,
                root: this.options.root,
            });
        }
    }

    private humanizeCpuModelName(cpuModelName) {
        if (!cpuModelName) {
            return;
        }
        cpuModelName = cpuModelName.replace(/\(R\)/g, "");
        cpuModelName = cpuModelName.replace(/\ CPU/g, "");
        cpuModelName = cpuModelName.replace(/\ Processor/g, "");
        cpuModelName = cpuModelName.replace(/\Intel /g, "");
        return cpuModelName;
    }
}
