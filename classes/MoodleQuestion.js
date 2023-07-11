"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
const MoodleQMultiChoice_1 = __importDefault(require("./MoodleQMultiChoice"));
const debug_1 = __importDefault(require("debug"));
const MoodleQShortAnswer_1 = __importDefault(require("./MoodleQShortAnswer"));
const MoodleQTrueFalse_1 = __importDefault(require("./MoodleQTrueFalse"));
class MoodleQuestion {
    //TODO: Replace with Custom Error class in the future
    static _error(message) {
        return new Error(message);
    }
    static _extractText(parsedHTML) {
        MoodleQuestion._debug(`Extracting question text...`);
        const textElement = parsedHTML.querySelector('.qtext');
        if (!textElement)
            throw MoodleQuestion._error(`Could not find question text.`);
        MoodleQuestion._debug(`Successfully extracted question text <${textElement.text}>.`);
        return textElement.text;
    }
    static _extractInstance(parsedHTML) {
        MoodleQuestion._debug(`Extracting question instance number...`);
        const couldNotFind = (thing) => `Could not find ${thing} in question.`;
        const questionElement = parsedHTML.querySelector('div');
        if (!questionElement)
            throw MoodleQuestion._error(couldNotFind('question element'));
        const htmlId = questionElement.getAttribute('id');
        if (!htmlId)
            throw MoodleQuestion._error(couldNotFind('htmlId'));
        const idRegex = RegExp(`question-([0-9]*)-[0-9]*`);
        const matchObj = idRegex.exec(htmlId);
        if (!matchObj)
            throw MoodleQuestion._error(couldNotFind('instance match'));
        const instance = matchObj[1];
        if (!instance)
            throw MoodleQuestion._error(couldNotFind('instance match'));
        MoodleQuestion._debug(`Successfully extracted question instance number <${instance}>.`);
        return Number(instance);
    }
    static parseQuestions(questions) {
        const parsedQuestions = [];
        for (const question of questions) {
            const parsedQuestion = MoodleQuestion.parse(question);
            parsedQuestions.push(parsedQuestion);
        }
        return parsedQuestions;
    }
    static parse(question) {
        MoodleQuestion._debug(`Parsing question #${question.slot} of type: ${question.type}...`);
        switch (question.type) {
            case types_1.QuestionTypes.MultiChoice: {
                MoodleQuestion._debug(`Multichoice question detected, passing to multichoice helper...`);
                return MoodleQMultiChoice_1.default.parse(question);
            }
            case types_1.QuestionTypes.ShortAnswer:
                return MoodleQShortAnswer_1.default.parse(question);
            case types_1.QuestionTypes.TrueFalse:
                return MoodleQTrueFalse_1.default.parse(question);
            default: {
                MoodleQuestion._debug(`${question.type} question was encountered, this type is unsupported.`);
                throw MoodleQuestion._error(`An Unsupported question type ${question.type} was encountered.`);
            }
        }
    }
    static cheatFrom(destination, source, checkMatch = true) {
        if (checkMatch) {
            if (!MoodleQuestion.match(destination, source))
                throw MoodleQuestion._error(`Trying to copy answer from question with incompatible type.`);
        }
        switch (destination.type) {
            case types_1.QuestionTypes.MultiChoice:
                return MoodleQMultiChoice_1.default.cheatFrom(destination, source);
            default:
                return MoodleQMultiChoice_1.default.cheatFrom(destination, source);
        }
    }
    static match(questionA, questionB) {
        MoodleQuestion._debug(`Matching questions <${questionA.instance}> and <${questionB.instance}>`);
        if (questionA.type !== questionB.type)
            return false;
        switch (questionA.type) {
            case types_1.QuestionTypes.MultiChoice:
                MoodleQuestion._debug(`Mutlichoice questions detected, passing to multichoice question helper...`);
                return MoodleQMultiChoice_1.default.match(questionA, questionB);
            default:
                throw MoodleQuestion._error(`Unknown question types, cannot match questions.`);
        }
    }
    static toUpdate(question) {
        MoodleQuestion._debug(`Converting question to update object...`);
        switch (question.type) {
            case types_1.QuestionTypes.MultiChoice:
                MoodleQuestion._debug(`Multichoice question detected, passing to multichoice helper...`);
                return MoodleQMultiChoice_1.default.toUpdate(question);
            default:
                throw MoodleQuestion._error(`Unknown question type, cannot convert to update object.`);
        }
    }
}
MoodleQuestion._debug = (0, debug_1.default)('moodle:helper:question');
exports.default = MoodleQuestion;
