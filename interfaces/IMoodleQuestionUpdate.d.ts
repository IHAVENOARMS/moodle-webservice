import NumericBoolean from "../types/NumericBoolean";
export default interface IMoodleQuestionUpdate {
    slot: number;
    instance: string | number;
    answer?: string | number;
    sequencecheck?: number;
    flagged?: NumericBoolean;
}
