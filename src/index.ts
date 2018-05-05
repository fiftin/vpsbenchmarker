import ProviderFactory from "./ProviderFactory";
import Benchmarker from "./Benchmarker";

import {argv} from "yargs";
import CpuBenchmark from "./sysbench/CpuBenchmark";

const config = require("./config.json");

const factory = new ProviderFactory();

const provider = factory.createProvider(argv.provider);

const benchmarks = argv.benchmarks.split(",").map(key => {
    return new CpuBenchmark(config.benchmarks[key]);
});

const benchmarker = new Benchmarker(provider, benchmarks);

benchmarker.start().then(result => {
    ;
}, err => {
    ;
});

