import Iperf3Parser from "./Iperf3Parser";
import Parser, {FieldType} from "./Parser";

export default class Parsers {
    public static networkIperf3 = new Iperf3Parser();

    public static memInfo = new Parser(new Map([
        ["memTotal",    { type: FieldType.Int, regexp: /^MemTotal:\s*(.*) kB$/, indexInRegexp: 1 }],
        ["memFree",     { type: FieldType.Int, regexp: /^MemFree:\s*(.*) kB$/, indexInRegexp: 1 }],
    ]));

    public static cpuInfo = new Parser(new Map([
        ["vendorId",    { type: FieldType.String, regexp: /^vendor_id\s+:\s*(.*)$/, indexInRegexp: 1 }],
        ["cpuFamily",   { type: FieldType.String, regexp: /^cpu family\s+:\s*(.*)$/, indexInRegexp: 1 }],
        ["model",       { type: FieldType.String, regexp: /^model\s+:\s*(.*)$/, indexInRegexp: 1 }],
        ["modelName",   { type: FieldType.String, regexp: /^model name\s+:\s*(.*)$/, indexInRegexp: 1 }],
        ["cpuMhz",      { type: FieldType.Float,  regexp: /^cpu MHz\s+:\s*(.*)$/, indexInRegexp: 1 }],
        ["cacheSize",   { type: FieldType.String, regexp: /^cache size\s+:\s*(.*)$/, indexInRegexp: 1 }],
    ]));

    public static cpuSysbench = new Parser(new Map([
        ["numberOfThreads", { type: FieldType.Int, regexp: /^\s*Number of threads:\s+(\d+)\s*$/, indexInRegexp: 1 }],
        [
            "totalNumberOfEvents",
            { type: FieldType.Int, regexp: /^\s*total number of events:\s+(\d+)\s*$/, indexInRegexp: 1 },
        ],
        ["totalTime", { type: FieldType.Float, regexp: /^\s*total time:\s+([\d.]+)s\s*$/, indexInRegexp: 1 }],
    ]));

    public static ioSysbench = new Parser(new Map([
        ["numberOfThreads", { type: FieldType.Int, regexp: /^\s*Number of threads:\s+(\d+)\s*$/, indexInRegexp: 1 }],
        [
            "totalNumberOfEvents",
            { type: FieldType.Int, regexp: /^\s*total number of events:\s+(\d+)\s*$/, indexInRegexp: 1 },
        ],
        ["totalTime", { type: FieldType.Float, regexp: /^\s*total time:\s+([\d.]+)s\s*$/, indexInRegexp: 1 }],
    ]));
}
