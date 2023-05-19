import { IMoodleQuestion } from '../interfaces';
import IMoodleParsedQuestion from '../interfaces/IMoodleParsedQuestion';
export default abstract class MoodleQShortAnswer {
    private static _debug;
    private static _error;
    private static _couldNotFind;
    private static _parseSettings;
    private static _checkCompatibility;
    private static _extractWritten;
    private static _removeHTML;
    private static _extractAnswerFromHTML;
    static parse(question: IMoodleQuestion): IMoodleParsedQuestion;
}
