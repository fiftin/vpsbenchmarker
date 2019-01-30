import {expect} from "chai";
import Benchmarker from "./Benchmarker";
import {BenchmarkStatus, BenchmarkType} from "./IBenchmark";

describe("Benchmarker", () => {
    describe("#calcRating", () => {
        it("Should return valid rating for bandwidth 10G", () => {
            const metrics = new Map();
            metrics.set("networkBandwidth", 10000000000);
            const res = Benchmarker.calcRating({
                benchmarkId: "iperf3-us",
                env: null,
                metrics,
                rating: 0,
                serverRating: 0,
                status: BenchmarkStatus.Success,
                stdout: "",
                testId: "",
                type: BenchmarkType.Network,
            });
            expect(res).to.eq(1666);
        });
    });
});
