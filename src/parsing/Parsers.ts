import Parser, {FieldType} from "./Parser";

export default class Parsers {
    public static cpuSysbench = new Parser(new Map([
        ["numberOfThreads", { type: FieldType.Int, regexp: /^\s*Number of threads:\s+(\d+)\s*$/, indexInRegexp: 1 }],
        [
            "totalNumberOfEvents",
            { type: FieldType.Int, regexp: /^\s*total number of events:\s+(\d+)\s*$/, indexInRegexp: 1 },
        ],
        ["totalTime", { type: FieldType.Float, regexp: /^\s*total time:\s+([\d.]+)s\s*$/, indexInRegexp: 1 }],
    ]));
}
