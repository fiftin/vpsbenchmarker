export enum FieldType {
    Int,
    Float,
    String,
}

export interface IFieldTemplate {
    type: FieldType;
    regexp: RegExp;
    indexInRegexp: number;
}

export default class Parser {
    private readonly templates: Map<string, IFieldTemplate>;

    constructor(templates: Map<string, IFieldTemplate>) {
        this.templates = new Map<string, IFieldTemplate>(templates);
    }

    public parse(str: string): object {
        const ret = {};

        for (const line of str.split("\n")) {
            for (const field of Object.keys(this.templates)) {
                const template = this.templates[field];
                const m = line.match(template.regexp);
                if (!m) {
                    continue;
                }
                switch (template.type) {
                    case FieldType.Int:
                        ret[field] = parseInt(m[template.indexInRegexp], 10);
                        break;
                    case FieldType.Float:
                        ret[field] = parseFloat(m[template.indexInRegexp]);
                        break;
                    default:
                        ret[field] = m[template.indexInRegexp];
                        break;
                }
            }
        }

        return ret;
    }
}