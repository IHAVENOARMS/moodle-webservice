"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_html_parser_1 = require("node-html-parser");
const MoodleQuestion_1 = __importDefault(require("./MoodleQuestion"));
const types_1 = require("../types");
const debug_1 = __importDefault(require("debug"));
class MoodleQTrueFalse {
    //TODO: Replace with Custom Error class in the future
    static _error(message) {
        return new Error(message);
    }
    static _couldNotFind(thing) {
        return MoodleQTrueFalse._error(`Could not find ${thing} in HTML data.`);
    }
    static _extractChoiceLabel(choiceElement) {
        MoodleQTrueFalse._debug(`Extracting label from choice HTML element...`);
        const labelElement = choiceElement.querySelector('label');
        if (!labelElement)
            throw MoodleQTrueFalse._couldNotFind(`label element`);
        const label = labelElement.text;
        MoodleQTrueFalse._debug(`Successfully extracted label: ${label} from choice HTML element.`);
        return label;
    }
    static _extractChoiceInputElement(choiceElement) {
        MoodleQTrueFalse._debug(`Extracting input element from choice HTML element...`);
        const inputElement = choiceElement.querySelector('input[type="radio"]');
        if (!inputElement)
            throw MoodleQTrueFalse._couldNotFind('input element');
        MoodleQTrueFalse._debug(`Successfully extracted input element from choice HTML element.`);
        return inputElement;
    }
    static _extractChoice(choiceElement) {
        const inputElement = MoodleQTrueFalse._extractChoiceInputElement(choiceElement);
        const label = MoodleQTrueFalse._extractChoiceLabel(choiceElement);
        const isChosen = inputElement.getAttribute('checked') === 'checked';
        const value = Number(inputElement.getAttribute('value'));
        //TODO: Find what images look like and extract them as well.
        const choice = { label, value };
        return { choice, isChosen };
    }
    static _extractChoices(parsedHTML) {
        let chosen;
        const choices = [];
        const choiceElements = parsedHTML.querySelectorAll('.answer > div');
        if (choiceElements.length === 0)
            throw MoodleQTrueFalse._couldNotFind('choice elements');
        for (let i = 0; i < choiceElements.length; i++) {
            const choiceElement = choiceElements[i];
            MoodleQTrueFalse._debug(`Extracting choice number: ${i}...`);
            const { choice, isChosen } = MoodleQTrueFalse._extractChoice(choiceElement);
            choices.push(choice);
            MoodleQTrueFalse._debug(`Successfully extracted choice number: ${i}.`);
            if (isChosen) {
                MoodleQTrueFalse._debug(`Found selected answer: #${choice.value}.`);
                chosen = choice.value;
            }
        }
        return { choices, chosen };
    }
    static _extractAnswerFromChoices(choices, chosen) {
        const answer = choices.find((choice) => choice.value === chosen);
        if (answer) {
            MoodleQTrueFalse._debug(`Successfully retrieved answer from choices.`);
        }
        else {
            MoodleQTrueFalse._debug(`Could not find answer within choices... possible bug here.`);
        }
        return answer;
    }
    static _extractAnswerLabelFromHTML(parsedHTML) {
        var _a, _b;
        const answerBoxText = (_a = parsedHTML.querySelector('.rightanswer')) === null || _a === void 0 ? void 0 : _a.text;
        const answer = (_b = /correct answer is '([\s\S]*)'./.exec(answerBoxText !== null && answerBoxText !== void 0 ? answerBoxText : '')) === null || _b === void 0 ? void 0 : _b[1];
        if (answer)
            MoodleQTrueFalse._debug(`Successfully extracted answer label from HTML, label: <${answer}>.`);
        else
            MoodleQTrueFalse._debug(`Could not find answer label in HTML, possible bug here.`);
        return answer;
    }
    static _parseSettings(settings) {
        return JSON.parse(settings);
    }
    static _checkCompatibility(question) {
        if (question.type !== types_1.QuestionTypes.TrueFalse)
            throw MoodleQTrueFalse._error('Trying to parse a question that is not truefalse!');
    }
    static _removeHTML(question) {
        const noHTMLQuestion = Object.assign({}, question);
        delete noHTMLQuestion.html;
        return noHTMLQuestion;
    }
    static toUpdate(question) {
        var _a;
        const answer = (_a = question.answer) === null || _a === void 0 ? void 0 : _a.value;
        MoodleQTrueFalse._debug(`Successfully converted truefalse question <${question.instance}> to update object.`);
        return {
            instance: question.instance,
            slot: question.slot,
            answer,
            flagged: question.flagged ? 1 : 0,
            sequencecheck: question.sequencecheck,
        };
    }
    /**Copies answer from source and returns a new question object with the correct answer
     * if no answer is found, the destination question is returned as is.
     */
    static cheatFrom(destination, source) {
        for (const destChoice of destination.choices) {
            const typedAnswer = source.answer;
            if (destChoice.label === typedAnswer.label) {
                return Object.assign(Object.assign({}, destination), { chosen: destChoice.value, answer: {
                        label: typedAnswer.label,
                        value: destChoice.value,
                    } });
            }
        }
        return destination;
    }
    static match(questionA, questionB) {
        //TODO: find a stricter criteria for finding matching questions.
        MoodleQTrueFalse._debug(`Matching truefalse questions <${questionA.instance}:${questionA.slot}> and <${questionB.instance}:${questionB.slot}>...`);
        const match = questionA.text === questionB.text;
        MoodleQTrueFalse._debug(match
            ? `Questions <${questionA.instance}:${questionA.slot}> and <${questionB.instance}:${questionB.slot}> match!`
            : `Questions <${questionA.instance}:${questionA.slot}> and <${questionB.instance}:${questionB.slot}> do not match.`);
        return match;
    }
    static parse(question) {
        var _a;
        MoodleQTrueFalse._debug(`Parsing truefalse question #${question.slot}...`);
        MoodleQTrueFalse._checkCompatibility(question);
        const settings = MoodleQTrueFalse._parseSettings(question.settings);
        const parsedHTML = (0, node_html_parser_1.parse)(question.html);
        // Accessing 'private' members.
        // Since there is really no such thing as 'private' members in javascript
        const instance = MoodleQuestion_1.default['_extractInstance'](parsedHTML);
        const text = MoodleQuestion_1.default['_extractText'](parsedHTML);
        const { choices, chosen } = MoodleQTrueFalse._extractChoices(parsedHTML);
        //Only answered questions have a state
        let answer;
        if (question.state) {
            switch (question.state) {
                case types_1.QuestionStates.GradedRight:
                    MoodleQTrueFalse._debug(`Question is already graded right, getting the chosen answer...`);
                    answer = MoodleQTrueFalse._extractAnswerFromChoices(choices, chosen);
                    break;
                default:
                    MoodleQTrueFalse._debug(`Question is graded wrong or given up on, extracting answer from HTML...`);
                    const answerLabel = MoodleQTrueFalse._extractAnswerLabelFromHTML(parsedHTML);
                    const answerValue = (_a = choices.find((choice) => choice.label === answerLabel)) === null || _a === void 0 ? void 0 : _a.value;
                    if (answerValue)
                        MoodleQTrueFalse._debug(`Succesfully extracted answer value from HTML, value: <${answerValue}>.`);
                    else
                        MoodleQTrueFalse._debug(`Could not extract answer value from HTML, possible bug here.`);
                    answer = { label: answerLabel, value: answerValue };
                    break;
            }
        }
        else
            MoodleQTrueFalse._debug(`Question is not graded, cannot extract answer.`);
        MoodleQTrueFalse._debug(`Successfully parsed truefalse question #${question.slot}...`);
        return Object.assign(Object.assign({}, MoodleQTrueFalse._removeHTML(question)), { mark: question.mark ? Number(question.mark) : undefined, settings,
            instance,
            text,
            choices,
            chosen,
            answer });
    }
}
MoodleQTrueFalse._debug = (0, debug_1.default)('moodle:helper:question:truefalse');
exports.default = MoodleQTrueFalse;
