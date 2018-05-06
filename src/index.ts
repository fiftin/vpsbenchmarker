import {argv} from "yargs";
import Benchmarker from "./Benchmarker";
import SysbenchCpuBenchmark from "./benchmarks/SysbenchCpuBenchmark";
import ProviderFactory from "./ProviderFactory";

const config = require("./config.json");


const provider = new ProviderFactory().createProvider(argv.provider);

const benchmarks = argv.benchmarks.split(",").map((key) => {
    if (config.benchmarks[key] == null) {
        throw new Error(`Benchmark with name ${key} does not exists`);
    }
    switch (config.benchmarks[key].type) {
        case "SysbenchCpuBenchmark":
            return new SysbenchCpuBenchmark(config.benchmarks[key]);
    }
});

const benchmarker = new Benchmarker(provider, benchmarks);

const logger = console;

(async () => {
    const results = await benchmarker.start();
    logger.log(results);
})().then(() => {
    process.exit();
}, (err) => {
    logger.error(err);
    process.exit();
});
