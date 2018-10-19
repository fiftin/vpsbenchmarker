## VPS Benchmarker
![Logo](https://raw.githubusercontent.com/fiftin/vpsbenchmarker/master/logo-100.png)

Tool for benchmarking VPS servers with using API of cloud providers.

### How it works

* It creates virtual server with using cloud service API.
* It connects to server over SSH and runs benchmarks.
* It terminates server with using cloud service API.
* It stores results to [mydataspace.org](https://mydataspace.org) / [web20.site](https://web20.site). Can be customized by you.

### Supported services
* [Hetzner](https://hetzner.cloud)
* [Linode](https://linode.com)
* [DigitalOcean](https://digitalocean.com)
* [Amazon Lightsail](https://lightsail.aws.amazon.com)
* [Vultr](https://vultr.com)

### Supported benchmarking tools
* [sysbench](https://github.com/akopytov/sysbench) &mdash; Scriptable database and system performance benchmark.
* iperf3 &mdash; Tool for testing of network bandwidth.

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
Example of benchmark 1 core CPU with using tool [sysbench](https://github.com/akopytov/sysbench):
```json
{
  "benchmarks": {
    "sysbench-cpu-1core": {
      "type": "sysbench",
      "test": "cpu",
      "threads": 1,
      "max-requests": -1,
      "max-time": 300
    }
  }
}
```

Each benchmark has unique name (`sysbench-cpu-1core`). It uses to link from other sections of configuration.

`type` specifies witch type of benchmark should be used. Available next types:
* `sysbench` &mdash; benchmarking CPU, memory, disk with using [sysbench](https://github.com/akopytov/sysbench) tool.
    You can use any options of sysbench in for this benchmark. For example option `test` can be:
    - `cpu` &mdash; CPU benchmark. <br>
        Additional options: <br>
        `threads` &mdash; Number of threads.
    - `memory` &mdash; I/O benchmark. <br>
        Additional options: <br>
        `size` &mdash; Space in gigabytes should be used for benchmarking.
* `iperf3` &mdash; benchmark network bandwidth with using tool iperf3.
* `cpuinfo` &mdash; getting info about CPU from `/proc/cpuinfo`.
* `meminfo` &mdash; getting info about memory from `/proc/meminfo`.

#### ```storage```

Where you can store results of benchmarking. Now supported only mydataspace.net / web20.site storage.

Example:
```json
"storage": {
  "type": "MdsStorage",
  "clientId": "***",
  "accessToken": "***",
  "root": "cloudbench",
  "path": "results",
  "groupedResultsPath": "grouped-results"
}
```

#### ```providers```

Contains configurations for access to cloud providers API.

Example:
```json
"providers": {
  "digitalocean": {
    "name": "DigitalOcean",
    "settings": {
      "apiToken": "***",
      "sshKey": "234234",
      "privateKey": "C:\\Users\\john\\.ssh\\id_rsa"
    },
    "servers": {
      "digitalocean-512mb-nyc1": {
        "name": "512mb-nyc1",
        "type": "512mb",
        "image": "ubuntu-16-04-x64",
        "location": "nyc3"
      },
    }
  } 
}
```

### Where I can see results?

We use this tool on [cloudbench.io](https://cloudbench.io). We collect cloud plan specifications, thoroughly test their performance and provide screening and comparison tools to make cloud search easy and fun.

Our blog with last news of cloud computing industry: [https://cloudbench.io/blog/en](https://cloudbench.io/blog/en).