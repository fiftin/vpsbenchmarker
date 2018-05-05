import ProviderFactory from "./ProviderFactory";
import Benchmarker from "./Benchmarker";

import {argv} from "yargs";
import CpuBenchmark from "./sysbench/CpuBenchmark";
import {SshClient} from "./SshClient";

const config = require("./config.json");

const factory = new ProviderFactory();

const provider = factory.createProvider(argv.provider);

const benchmarks = argv.benchmarks.split(",").map(key => {
    return new CpuBenchmark(config.benchmarks[key]);
});

const benchmarker = new Benchmarker(provider, benchmarks);

//benchmarker.start().then(result => {
//    ;
//}, err => {
//    ;
//});

const sshClient = new SshClient({
    host: "195.201.91.117",
    username: "root",
    privateKey: "C:\\Users\\fifti\\.ssh\\id_rsa"
});

sshClient.connect().then(() => {
    return sshClient.runCommand("ls");
}).then(result => {
    console.log(result);
}, err => {
    console.log(err);
}).then(() => process.exit());