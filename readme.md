## VPS Benchmarker
![Logo](https://raw.githubusercontent.com/fiftin/vpsbenchmarker/master/logo-100.png)

### How it works

* It creates virtual server with using cloud service API.
* It connects to server over SSH and runs benchmarks.
* It terminates server with using cloud service API.
* It stores results to [mydataspace.org](https://mydataspace.org).

### Supported services
* [Hetzner](https://hetzner.cloud)
* [Linode](https://linode.com)
* [DigitalOcean](https://digitalocean.com)
* [Amazon Lightsail](https://lightsail.aws.amazon.com)

### Supported benchmarking tools
* [sysbench](https://github.com/akopytov/sysbench) &mdash; Scriptable database and system performance benchmark.


### How to use

```npm run start --provider=hetzner --server=test```

### Configuration

Configuration reads from ```config.json```. Example of configuration you can find in [config-example.json](config-example.json).

Config contains 3 root sections:
* ```benchmarks```
* ```storage```
* ```providers```

Below for details of each.

#### ```benchmarks```
Example:
```json
{
  "benchmarks": {
    "sysbench-cpu-1core": {
      "type": "SysbenchCpuBenchmark",
      "threads": 1
    }
  }
}
```

Each benchmark has unique name (`sysbench-cpu-1core`). It uses to link from other sections of configuration.

`type` specifies witch type of benchmark should be used. Available next types:
* `SysbenchCpuBenchmark` &mdash; CPU benchmark with using tool [sysbench](https://github.com/akopytov/sysbench). <br>
    Options: <br>
    `threads` &mdash; Number of threads.
* `SysbenchIOBenchmark` &mdash; I/O benchmark with using tool [sysbench](https://github.com/akopytov/sysbench). <br>
    Options: <br>
    `size` &mdash; Space in gigabytes should be used for benchmarking.
* `SysbenchMysqlBenchmark` &mdash; MySQL benchmark with using tool [sysbench](https://github.com/akopytov/sysbench). <br>
