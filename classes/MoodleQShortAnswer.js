"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_html_parser_1 = require("node-html-parser");
const MoodleQuestion_1 = __importDefault(require("./MoodleQuestion"));
const types_1 = require("../types");
const debug_1 = __importDefault(require("debug"));
class MoodleQShortAnswer {
    //TODO: Replace with Custom Error class in the future
    static _error(message) {
        return new Error(message);
    }
    static _couldNotFind(thing) {
        return MoodleQShortAnswer._error(`Could not find ${thing} in HTML data.`);
    }
    static _parseSettings(settings) {
        return JSON.parse(settings);
    }
    static _checkCompatibility(question) {
        if (question.type !== types_1.QuestionTypes.ShortAnswer)
            throw MoodleQShortAnswer._error('Trying to parse a question that is not short answer!');
    }
    static _extractWritten(parsedHTML) {
        var _a;
        return (_a = parsedHTML
            .querySelector('span.answer > input')) === null || _a === void 0 ? void 0 : _a.getAttribute('value');
    }
    static _removeHTML(question) {
        const noHTMLQuestion = Object.assign({}, question);
        delete noHTMLQuestion.html;
        return noHTMLQuestion;
    }
    static _extractAnswerFromHTML(parsedHTML) {
        var _a, _b;
        const answerBoxText = (_a = parsedHTML.querySelector('.rightanswer')) === null || _a === void 0 ? void 0 : _a.text;
        const answer = (_b = /(is|are)[ ]?:[ ]?([\s\S]*)/.exec(answerBoxText !== null && answerBoxText !== void 0 ? answerBoxText : '')) === null || _b === void 0 ? void 0 : _b[2];
        if (answer)
            MoodleQShortAnswer._debug(`Successfully extracted answer label from HTML, label: <${answer}>.`);
        else
            MoodleQShortAnswer._debug(`Could not find answer label in HTML, possible bug here.`);
        return answer;
    }
    static parse(question) {
        MoodleQShortAnswer._debug(`Parsing shortanswer question #${question.slot}...`);
        MoodleQShortAnswer._checkCompatibility(question);
        const settings = MoodleQShortAnswer._parseSettings(question.settings);
        const parsedHTML = (0, node_html_parser_1.parse)(question.html);
        // Accessing 'private' members.
        // Since there is really no such thing as 'private' members in javascript
        const instance = MoodleQuestion_1.default['_extractInstance'](parsedHTML);
        const text = MoodleQuestion_1.default['_extractText'](parsedHTML);
        //Only answered questions have a state
        let answer;
        let written;
        written = MoodleQShortAnswer._extractWritten(parsedHTML);
        if (question.state) {
            if (question.state === types_1.QuestionStates.GradedRight ||
                question.state === types_1.QuestionStates.GradedWrong) {
                MoodleQShortAnswer._debug(`Question is already graded right, getting the correct answer...`);
                answer = MoodleQShortAnswer._extractAnswerFromHTML(parsedHTML);
            }
        }
        else {
            MoodleQShortAnswer._debug(`Question is not graded, cannot extract answer.`);
            MoodleQShortAnswer._debug(`Successfully parsed multichoice question #${question.slot}...`);
        }
        return Object.assign(Object.assign({}, MoodleQShortAnswer._removeHTML(question)), { mark: question.mark ? Number(question.mark) : undefined, settings,
            instance,
            text,
            written,
            answer });
    }
}
exports.default = MoodleQShortAnswer;
MoodleQShortAnswer._debug = (0, debug_1.default)('moodle:helper:question:shortanswer');
