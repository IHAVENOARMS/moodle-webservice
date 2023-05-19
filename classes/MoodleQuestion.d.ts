import { IMoodleQuestion, IMoodleQuestionUpdate } from '../interfaces';
import IMoodleParsedQuestion from '../interfaces/IMoodleParsedQuestion';
export default abstract class MoodleQuestion {
    private static _debug;
    private static _error;
    private static _extractText;
    private static _extractInstance;
    static parseQuestions(questions: IMoodleQuestion[]): IMoodleParsedQuestion[];
    static parse(question: IMoodleQuestion): IMoodleParsedQuestion;
    static cheatFrom(destination: IMoodleParsedQuestion, source: IMoodleParsedQuestion, checkMatch?: boolean): IMoodleParsedQuestion;
    static match(questionA: IMoodleParsedQuestion, questionB: IMoodleParsedQuestion): boolean;
    static toUpdate(question: IMoodleParsedQuestion): IMoodleQuestionUpdate;
}
