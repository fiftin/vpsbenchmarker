## VPS Benchmarker
![Logo](https://raw.githubusercontent.com/fiftin/vpsbenchmarker/master/logo.png)

### How it works

* It creates virtual server with using cloud service API.
* It connects to server over SSH and runs benchmarks.
* It terminates server with using cloud service API.
* It stores results to [mydataspace.org](https://mydataspace.org).

### Supported services
* [Hetzner](https://hetzner.cloud)

### Supported benchmarking tools
* [sysbench](https://github.com/akopytov/sysbench) &mdash; Scriptable database and system performance benchmark.


### How to use

```npm run start --provider=hetzner --benchmarks=sysbench-cpu-2cores-2g```

### Configuration

Configuration reads from ```dist/config.json```.


