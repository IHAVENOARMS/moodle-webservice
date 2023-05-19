import IMoodleQuestionUpdate from "../interfaces/IMoodleQuestionUpdate";
export default class MoodleAttemptUpdate {
    [k: string]: any;
    constructor(updates: IMoodleQuestionUpdate[]);
    private _loadUpdate;
}
