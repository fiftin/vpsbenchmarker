export enum FieldType {
    Int,
    Float,
    String,
}

export class FieldTemplate {
    public type: FieldType;
    public regexp: RegExp;
    public indexInRegexp: number;
}
