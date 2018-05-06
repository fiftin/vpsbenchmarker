import Benchmarker from "./Benchmarker";
import ProviderFactory from "./ProviderFactory";

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

const logger = console;

const sshClient = new SshClient({
    host: "195.201.91.117",
    privateKey: "C:\\Users\\fifti\\.ssh\\id_rsa",
    username: "root",
});

(async () => {
    await sshClient.connect();
    logger.log(await sshClient.runCommand("apt remove sysbench -y"));
    logger.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
    logger.log(await sshClient.runCommand("apt install sysbench -y"));
})().then(() => {
    process.exit();
}, (err) => {
    logger.log(err);
});
