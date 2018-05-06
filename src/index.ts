import Benchmarker from "./Benchmarker";
import ProviderFactory from "./ProviderFactory";

import debug from "debug";
import {argv} from "yargs";
import {SshClient} from "./SshClient";
import CpuBenchmark from "./sysbench/CpuBenchmark";

const config = require("./config.json");

const factory = new ProviderFactory();

const provider = factory.createProvider(argv.provider);

const benchmarks = argv.benchmarks.split(",").map((key) => {
    return new CpuBenchmark(config.benchmarks[key]);
});

const benchmarker = new Benchmarker(provider, benchmarks);

// benchmarker.start().then(result => {
//    ;
// }, err => {
//    ;
// });

const sshClient = new SshClient({
    host: "195.201.91.117",
    privateKey: "C:\\Users\\fifti\\.ssh\\id_rsa",
    username: "root",
});

sshClient.connect().then(() => {
    return sshClient.runCommand("tail");
}).then((result) => {
    debug(result);
}, (err) => {
    debug(err);
}).then(() => process.exit());
