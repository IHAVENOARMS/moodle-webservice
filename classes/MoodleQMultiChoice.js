"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_html_parser_1 = require("node-html-parser");
const MoodleQuestion_1 = __importDefault(require("./MoodleQuestion"));
const types_1 = require("../types");
const debug_1 = __importDefault(require("debug"));
class MoodleQMultiChoice {
    //TODO: Replace with Custom Error class in the future
    static _error(message) {
        return new Error(message);
    }
    static _couldNotFind(thing) {
        return MoodleQMultiChoice._error(`Could not find ${thing} in HTML data.`);
    }
    static _removeChoiceNumber(label) {
        return label.slice(3);
    }
    static _extractChoiceLabel(choiceElement) {
        MoodleQMultiChoice._debug(`Extracting label from choice HTML element...`);
        const labelElement = choiceElement.querySelector('div[data-region="answer-label"]');
        if (!labelElement)
            throw MoodleQMultiChoice._couldNotFind(`label element`);
        const label = MoodleQMultiChoice._removeChoiceNumber(labelElement.text);
        MoodleQMultiChoice._debug(`Successfully extracted label: ${label} from choice HTML element.`);
        return label;
    }
    static _extractChoiceInputElement(choiceElement) {
        MoodleQMultiChoice._debug(`Extracting input element from choice HTML element...`);
        const inputElement = choiceElement.querySelector('input[type="radio"]');
        if (!inputElement)
            throw MoodleQMultiChoice._couldNotFind('input element');
        MoodleQMultiChoice._debug(`Successfully extracted input element from choice HTML element.`);
        return inputElement;
    }
    static _extractChoice(choiceElement) {
        const inputElement = MoodleQMultiChoice._extractChoiceInputElement(choiceElement);
        const label = MoodleQMultiChoice._extractChoiceLabel(choiceElement);
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
            throw MoodleQMultiChoice._couldNotFind('choice elements');
        for (let i = 0; i < choiceElements.length; i++) {
            const choiceElement = choiceElements[i];
            MoodleQMultiChoice._debug(`Extracting choice number: ${i}...`);
            const { choice, isChosen } = MoodleQMultiChoice._extractChoice(choiceElement);
            choices.push(choice);
            MoodleQMultiChoice._debug(`Successfully extracted choice number: ${i}.`);
            if (isChosen) {
                MoodleQMultiChoice._debug(`Found selected answer: #${choice.value}.`);
                chosen = choice.value;
            }
        }
        return { choices, chosen };
    }
    static _extractAnswerFromChoices(choices, chosen) {
        const answer = choices.find((choice) => choice.value === chosen);
        if (answer) {
            MoodleQMultiChoice._debug(`Successfully retrieved answer from choices.`);
        }
        else {
            MoodleQMultiChoice._debug(`Could not find answer within choices... possible bug here.`);
        }
        return answer;
    }
    static _extractAnswerLabelFromHTML(parsedHTML) {
        var _a, _b;
        const answerBoxText = (_a = parsedHTML.querySelector('.rightanswer')) === null || _a === void 0 ? void 0 : _a.text;
        const answer = (_b = /(is|are)[ ]?:[ ]?([\s\S]*)/.exec(answerBoxText !== null && answerBoxText !== void 0 ? answerBoxText : '')) === null || _b === void 0 ? void 0 : _b[2];
        if (answer)
            MoodleQMultiChoice._debug(`Successfully extracted answer label from HTML, label: <${answer}>.`);
        else
            MoodleQMultiChoice._debug(`Could not find answer label in HTML, possible bug here.`);
        return answer;
    }
    static _parseSettings(settings) {
        return JSON.parse(settings);
    }
    static _checkCompatibility(question) {
        if (!(question.type === types_1.QuestionTypes.MultiChoice ||
            question.type === types_1.QuestionTypes.TrueFalse))
            throw MoodleQMultiChoice._error('Trying to parse a question that is not multichoice!');
    }
    static _removeHTML(question) {
        const noHTMLQuestion = Object.assign({}, question);
        delete noHTMLQuestion.html;
        return noHTMLQuestion;
    }
    static toUpdate(question) {
        var _a;
        const answer = (_a = question.answer) === null || _a === void 0 ? void 0 : _a.value;
        MoodleQMultiChoice._debug(`Successfully converted multichoice question <${question.instance}> to update object.`);
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
        MoodleQMultiChoice._debug(`Matching multichoice questions <${questionA.instance}:${questionA.slot}> and <${questionB.instance}:${questionB.slot}>...`);
        const match = questionA.text === questionB.text;
        MoodleQMultiChoice._debug(match
            ? `Questions <${questionA.instance}:${questionA.slot}> and <${questionB.instance}:${questionB.slot}> match!`
            : `Questions <${questionA.instance}:${questionA.slot}> and <${questionB.instance}:${questionB.slot}> do not match.`);
        return match;
    }
    static parse(question) {
        var _a;
        MoodleQMultiChoice._debug(`Parsing multichoice question #${question.slot}...`);
        MoodleQMultiChoice._checkCompatibility(question);
        const settings = MoodleQMultiChoice._parseSettings(question.settings);
        const parsedHTML = (0, node_html_parser_1.parse)(question.html);
        // Accessing 'private' members.
        // Since there is really no such thing as 'private' members in javascript
        const instance = MoodleQuestion_1.default['_extractInstance'](parsedHTML);
        const text = MoodleQuestion_1.default['_extractText'](parsedHTML);
        const { choices, chosen } = MoodleQMultiChoice._extractChoices(parsedHTML);
        //Only answered questions have a state
        let answer;
        if (question.state) {
            switch (question.state) {
                case types_1.QuestionStates.GradedRight:
                    MoodleQMultiChoice._debug(`Question is already graded right, getting the chosen answer...`);
                    answer = MoodleQMultiChoice._extractAnswerFromChoices(choices, chosen);
                    break;
                default:
                    MoodleQMultiChoice._debug(`Question is graded wrong or given up on, extracting answer from HTML...`);
                    const answerLabel = MoodleQMultiChoice._extractAnswerLabelFromHTML(parsedHTML);
                    const answerValue = (_a = choices.find((choice) => choice.label === answerLabel)) === null || _a === void 0 ? void 0 : _a.value;
                    if (answerValue)
                        MoodleQMultiChoice._debug(`Succesfully extracted answer value from HTML, value: <${answerValue}>.`);
                    else
                        MoodleQMultiChoice._debug(`Could not extract answer value from HTML, possible bug here.`);
                    answer = { label: answerLabel, value: answerValue };
                    break;
            }
        }
        else
            MoodleQMultiChoice._debug(`Question is not graded, cannot extract answer.`);
        MoodleQMultiChoice._debug(`Successfully parsed multichoice question #${question.slot}...`);
        return Object.assign(Object.assign({}, MoodleQMultiChoice._removeHTML(question)), { mark: question.mark ? Number(question.mark) : undefined, settings,
            instance,
            text,
            choices,
            chosen,
            answer });
    }
}
exports.default = MoodleQMultiChoice;
MoodleQMultiChoice._debug = (0, debug_1.default)('moodle:helper:question:multichoice');
