import ProviderFactory from "./ProviderFactory";
import Benchmarker from "./Benchmarker";
const argv = require('yargs').argv;

const factory = new ProviderFactory();

const provider = factory.createProvider(argv.provider);

const benchmarks = [];

const benchmarker = new Benchmarker(provider, benchmarks);

benchmarker.start().then(result => {

}, err => {
    ;
});

