import Parser, {FieldType} from "./Parser";

export default class Parsers {
    public static cpuSysbench = new Parser(new Map([
        ["numberOfThreads", { type: FieldType.Int, regexp: /Number of threads:\s+(\d)\s*$/, indexInRegexp: 1 }],
        [
            "totalNumberOfEvents",
            { type: FieldType.Int, regexp: /total number of events:\s+(\d)\s*$/, indexInRegexp: 1 },
        ],
        ["totalTime", { type: FieldType.Float, regexp: /total time:\s+(\d.)s/, indexInRegexp: 1 }],
    ]));
}
