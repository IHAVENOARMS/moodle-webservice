import { IMoodleQuestion, IMoodleQuestionUpdate } from "../interfaces";
import IMoodleParsedQuestion from "../interfaces/IMoodleParsedQuestion";
export default abstract class MoodleQMultiChoice {
    private static _debug;
    private static _error;
    private static _couldNotFind;
    private static _removeChoiceNumber;
    private static _extractChoiceLabel;
    private static _extractChoiceInputElement;
    private static _extractChoice;
    private static _extractChoices;
    private static _extractAnswerFromChoices;
    private static _extractAnswerLabelFromHTML;
    private static _parseSettings;
    private static _checkCompatibility;
    private static _removeHTML;
    static toUpdate(question: IMoodleParsedQuestion): IMoodleQuestionUpdate;
    /**Copies answer from source and returns a new question object with the correct answer
     * if no answer is found, the destination question is returned as is.
     */
    static cheatFrom(destination: IMoodleParsedQuestion, source: IMoodleParsedQuestion): IMoodleParsedQuestion;
    static match(questionA: IMoodleParsedQuestion, questionB: IMoodleParsedQuestion): boolean;
    static parse(question: IMoodleQuestion): IMoodleParsedQuestion;
}
