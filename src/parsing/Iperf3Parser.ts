
export default class Iperf3Parser {
    public parse(str: string): Map<string, any> {
        const ret = new Map<string, any>();

        const items = str.split("\n").map((line) => {
            // [SUM]   7.00-8.00   sec  11.6 MBytes  97.0 Mbits/sec
            const m = line.match(/^\[SUM]\s+[^0][\d.-]+\s+sec\s+(?:[\d.]+) (?:\w+)\s+([\d.]+) (\w+)\/sec/);
            if (!m) {
                return;
            }

            const value = parseFloat(m[1]);

            let bandwidth;

            switch (m[2]) {
                case "Kbits":
                    bandwidth = value * 1000;
                    break;
                case "Mbits":
                    bandwidth = value * 1000000;
                    break;
                case "Gbits":
                    bandwidth = value * 1000000000;
                    break;
                default:
                    bandwidth = value;
            }

            return {
                bandwidth,
            };
        }).filter((item) => item != null);

        ret.set("items", items);

        ret.set("networkBandwidth", Math.floor(items.reduce((sum, value) => sum + value.bandwidth, 0) / items.length));

        return ret;
    }
}
