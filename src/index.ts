import {argv} from "yargs";
import Benchmarker from "./Benchmarker";
import SysbenchCpuBenchmark from "./benchmarks/SysbenchCpuBenchmark";
import {IBenchmark, IBenchmarkResult} from "./IBenchmark";
import {IStorage} from "./IStorage";
import ProviderFactory from "./ProviderFactory";
import {IHetznerServerOptions} from "./providers/Hetzner";
import MdsStorage from "./storages/MdsStorage";

if (!argv.provider) {
    throw new Error(`Provider does not specified. Please specify ` +
        `provider in command line in format "--provider=hetzner"`);
}

const config = require("../config.json");

const storage: IStorage = new MdsStorage({
    apiToken: config.storage,
    path: config.path,
    root: config.root,
});

function getProviderBenchmarks(providerId: string): Map<string, IBenchmark[]> {
    const providerInfo = config.providers[providerId];

    const benchmarks = argv.benchmarks ?
        argv.benchmarks.split(",") :
        Object.keys(providerInfo.benchmarks);

    return benchmarks.reduce((result, benchmarkId) => {
        const serverId = providerInfo.benchmarks[benchmarkId].server;
        let serverBenchmarks = result.get(serverId);
        if (serverBenchmarks == null) {
            serverBenchmarks = [];
            result.set(serverId, serverBenchmarks);
        }
        if (config.benchmarks[benchmarkId] == null) {
            throw new Error(`Benchmark with name ${benchmarkId} does not exists`);
        }
        let benchmark;
        switch (config.benchmarks[benchmarkId].type) {
            case "SysbenchCpuBenchmark":
                benchmark = new SysbenchCpuBenchmark(config.benchmarks[benchmarkId]);
                break;
            default:
                throw new Error(`Unknown benchmark type ${config.benchmarks[benchmarkId].type}`);
        }
        serverBenchmarks.push(benchmark);
        return result;
    }, new Map<string, IBenchmark[]>());
}

const logger = console;

(async () => {
    const resultsArray: IBenchmarkResult[] = [];

    const providerInfo = config.providers[argv.provider];
    const provider = new ProviderFactory().createProvider(argv.provider, providerInfo.settings);
    for (const [serverId, serverBenchmarks] of getProviderBenchmarks(argv.provider)) {
        const benchmarker = new Benchmarker<IHetznerServerOptions>(provider, serverBenchmarks);
        const serverResults = await benchmarker.start({
            image: providerInfo.servers[serverId].image,
            location: providerInfo.servers[serverId].location,
            name: providerInfo.servers[serverId].name,
            privateKey: providerInfo.settings.privateKey,
            type: providerInfo.servers[serverId].type,
        });
        resultsArray.push(...serverResults);
    }

    await storage.store(argv.provider, resultsArray);
})().then(() => {
    process.exit();
}, (err) => {
    logger.error(err);
    process.exit();
});
