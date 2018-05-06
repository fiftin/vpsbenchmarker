import {expect} from "chai";
import Parsers from "./Parsers";

describe("Parsers", () => {
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
        expect(res.totalTime).to.eq(0.6791);
    });
});
