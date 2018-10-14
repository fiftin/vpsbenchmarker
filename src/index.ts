import {argv} from "yargs";
import Benchmarker from "./Benchmarker";
import CpuInfo from "./benchmarks/CpuInfo";
import Iperf3Benchmark from "./benchmarks/Iperf3Benchmark";
import MemInfo from "./benchmarks/MemInfo";
import SysbenchCpuBenchmark from "./benchmarks/SysbenchCpuBenchmark";
import SysbenchIOBenchmark from "./benchmarks/SysbenchIOBenchmark";
import SysbenchMemoryBenchmark from "./benchmarks/SysbenchMemoryBenchmark";
import {IBenchmark} from "./IBenchmark";
import {IStorage} from "./IStorage";
import ProviderFactory from "./ProviderFactory";
import MdsStorage from "./storages/MdsStorage";

if (!argv.provider) {
    throw new Error(`Provider does not specified. Please specify ` +
        `provider in command line in format "--provider=hetzner"`);
}

const config = require("../config.json");

const storage: IStorage = new MdsStorage({
    accessToken: config.storage.accessToken,
    apiURL: config.storage.apiURL,
    clientId: config.storage.clientId,
    groupedResultsPath: config.storage.groupedResultsPath,
    path: config.storage.path,
    root: config.storage.root,
});

process.on("unhandledRejection", (reason, promise) => {
    logger.log("Unhandled Rejection at:", reason.stack || reason);
    // Recommended: send the information to sentry.io
    // or whatever crash reporting service you use
});

function getProviderBenchmarks(providerId: string): Map<string, IBenchmark[]> {
    const providerInfo = config.providers[providerId];

    const benchmarks = argv.server
        ? providerInfo.benchmarks.filter((b) => b.server.indexOf(argv.server) >= 0 || b.benchmark.indexOf(argv.server) >= 0)
        : providerInfo.benchmarks;

    return benchmarks.reduce((result, benchmarkInfo) => {
        const benchmarkId = benchmarkInfo.benchmark;
        const serverId = benchmarkInfo.server;
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
            case "sysbench":
                switch (config.benchmarks[benchmarkId].test) {
                    case "cpu":
                        benchmark = new SysbenchCpuBenchmark(config.benchmarks[benchmarkId]);
                        break;
                    case "fileio":
                        benchmark = new SysbenchIOBenchmark(config.benchmarks[benchmarkId]);
                        break;
                    case "memory":
                        benchmark = new SysbenchMemoryBenchmark(config.benchmarks[benchmarkId]);
                        break;
                    default:
                        throw new Error(`Unsupported sysbench test "${config.benchmarks[benchmarkId].test}"`);
                }
                break;
            case "info":
                switch (config.benchmarks[benchmarkId].test) {
                    case "cpu":
                        benchmark = new CpuInfo();
                        break;
                    case "mem":
                        benchmark = new MemInfo();
                        break;
                    default:
                        throw new Error(`Unsupported sysbench test "${config.benchmarks[benchmarkId].test}"`);
                }
                break;
            case "iperf3":
                switch (config.benchmarks[benchmarkId].test) {
                    case "network":
                        benchmark = new Iperf3Benchmark(config.benchmarks[benchmarkId]);
                        break;
                    default:
                        throw new Error(`Unsupported sysbench test "${config.benchmarks[benchmarkId].test}"`);
                }
                break;
            default:
                throw new Error(`Unknown benchmark type "${config.benchmarks[benchmarkId].type}"`);
        }
        benchmark.id = benchmarkId;
        serverBenchmarks.push(benchmark);
        return result;
    }, new Map<string, IBenchmark[]>());
}

const logger = console;

(async () => {
    const providerInfo = config.providers[argv.provider];
    const provider = new ProviderFactory().createProvider(argv.provider, providerInfo.settings);

    // const providerBenchmarks = getProviderBenchmarks(argv.provider)[Symbol.iterator]();
    // await Promise.all([...providerBenchmarks].map(async ([serverId, serverBenchmarks]) => {
    //     const benchmarker = new Benchmarker(provider, serverBenchmarks);
    //     const serverResults = await benchmarker.start({
    //         id: serverId,
    //         image: providerInfo.servers[serverId].image,
    //         location: providerInfo.servers[serverId].location,
    //         name: providerInfo.servers[serverId].name,
    //         privateKey: providerInfo.settings.privateKey,
    //         type: providerInfo.servers[serverId].type,
    //         username: providerInfo.servers[serverId].username,
    //     });
    //     await storage.storeServerResults(serverId, serverResults);
    // }));

    for (const [serverId, serverBenchmarks] of getProviderBenchmarks(argv.provider)) {
        const benchmarker = new Benchmarker(provider, serverBenchmarks);
        const serverResults = await benchmarker.start({
            id: serverId,
            image: providerInfo.servers[serverId].image,
            location: providerInfo.servers[serverId].location,
            name: providerInfo.servers[serverId].name,
            privateKey: providerInfo.settings.privateKey,
            type: providerInfo.servers[serverId].type,
            username: providerInfo.servers[serverId].username,
        });
        await storage.storeServerResults(serverId, serverResults);
    }

})().then(() => {
    process.exit();
}, (err) => {
    logger.error(err);
    process.exit();
});
