
export default class Iperf3Parser {
    public parse(str: string): Map<string, any> {
        const ret = new Map<string, any>();

        const items = str.split("\n").map((line) => {
            // [SUM]   7.00-8.00   sec  11.6 MBytes  97.0 Mbits/sec
            const m = line.match(/^\[SUM]\s+[\d.-]+\s+sec\s+(?:[\d.]+) (?:\w+)\s+([\d.]+) (\w+)\/sec/);
            if (!m) {
                return;
            }

            const bandwidth = parseFloat(m[1]);

            switch (m[2]) {
                case "Kbits":
                    return bandwidth * 1000;
                case "Mbits":
                    return bandwidth * 1000000;
                case "Gbits":
                    return bandwidth * 1000000000;
            }

            return bandwidth;
        }).filter((item) => item != null);

        ret.set("items", items);

        ret.set("networkBandwidth", items.reduce((sum, value) => sum + value, 0) / items.length);

        return ret;
    }
}
