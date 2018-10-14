import {expect} from "chai";
import Parsers from "./Parsers";

describe("Parsers", () => {
    describe("networkIperf3", () => {
        it("Should parse single line", () => {
            const res = Parsers.networkIperf3.parse("[SUM]  11.00-12.00  sec  12.1 MBytes   102 Mbits/sec    8");
            expect(res.get("networkBandwidth")).to.eq(102000000);
            expect(res.get("items").length).to.eq(1);
        });

        it("Should parse multi lines", () => {
            const res = Parsers.networkIperf3.parse(
                "[SUM]   0.00-1.00   sec  14.2 MBytes   119 Mbits/sec    0\n" +
                "[SUM]   1.00-2.00   sec  13.7 MBytes   115 Mbits/sec   32\n" +
                "[SUM]   2.00-3.00   sec  11.8 MBytes  99.2 Mbits/sec   24\n" +
                "[SUM]   3.00-4.00   sec  11.9 MBytes  99.7 Mbits/sec    9\n" +
                "[SUM]   4.00-5.00   sec  11.6 MBytes  97.2 Mbits/sec    0\n" +
                "[SUM]   5.00-6.00   sec  10.8 MBytes  91.0 Mbits/sec    8\n" +
                "[SUM]   6.00-7.00   sec  12.7 MBytes   107 Mbits/sec   10\n" +
                "[SUM]   7.00-8.00   sec  11.3 MBytes  95.1 Mbits/sec   12\n" +
                "[SUM]   8.00-9.00   sec  11.8 MBytes  98.7 Mbits/sec   10\n" +
                "[SUM]   9.00-10.00  sec  11.3 MBytes  95.1 Mbits/sec    6\n" +
                "[SUM]  10.00-11.00  sec  11.9 MBytes  99.7 Mbits/sec    6\n" +
                "[SUM]  11.00-12.00  sec  12.1 MBytes   102 Mbits/sec    8\n");
            expect(res.get("networkBandwidth")).to.eq(101558333);
            expect(res.get("items").length).to.eq(12);
        });
    });

    describe("cpuSysbench", () => {
        it("Should parse sysbench total time", () => {
            const res = Parsers.cpuSysbench.parse(
                "    total time:                          9.6701s\n");
            expect(res.get("totalTime")).to.eq(9.6701);
        });

        it("Should parse CPU sysbench results", () => {
            const res = Parsers.cpuSysbench.parse(
                "sysbench 0.4.12:  multi-threaded system evaluation benchmark\n" +
                "\n" +
                "Running the test with following options:\n" +
                "Number of threads: 2\n" +
                "\n" +
                "Doing CPU performance benchmark\n" +
                "\n" +
                "Threads started!\n" +
                "Done.\n" +
                "\n" +
                "Maximum prime number checked in CPU test: 10000\n" +
                "\n" +
                "\n" +
                "Test execution summary:\n" +
                "    total time:                          9.6701s\n" +
                "    total number of events:              20000\n" +
                "    total time taken by event execution: 19.3360\n" +
                "    per-request statistics:\n" +
                "         min:                                  0.81ms\n" +
                "         avg:                                  0.97ms\n" +
                "         max:                                  5.12ms\n" +
                "         approx.  95 percentile:               1.15ms\n" +
                "\n" +
                "Threads fairness:\n" +
                "    events (avg/stddev):           10000.0000/57.00\n" +
                "    execution time (avg/stddev):   9.6680/0.00\n");
            expect(res.get("totalTime")).to.eq(9.6701);
        });
    });
});
