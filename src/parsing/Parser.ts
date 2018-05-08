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

    public parse(str: string): Map<string, any> {
        const ret = new Map<string, any>();

        for (const line of str.split("\n")) {
            for (const [field, template] of this.templates) {
                const m = line.match(template.regexp);
                if (!m) {
                    continue;
                }
                switch (template.type) {
                    case FieldType.Int:
                        ret.set(field, parseInt(m[template.indexInRegexp], 10));
                        break;
                    case FieldType.Float:
                        ret.set(field, parseFloat(m[template.indexInRegexp]));
                        break;
                    default:
                        ret.set(field, template.indexInRegexp);
                        break;
                }
            }
        }

        return ret;
    }
}
