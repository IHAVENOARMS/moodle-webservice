"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MoodleAttemptUpdate_1 = __importDefault(require("./MoodleAttemptUpdate"));
const MoodleQuestion_1 = __importDefault(require("./MoodleQuestion"));
const debug_1 = __importDefault(require("debug"));
class MoodleAttempt {
    //TODO: Replace with Custom Error class in the future
    static _error(message) {
        return new Error(message);
    }
    static parse(attempt) {
        MoodleAttempt._debug(`Parsing attempt: ${attempt.attempt.id}...`);
        const parsedQuestions = MoodleQuestion_1.default.parseQuestions(attempt.questions);
        MoodleAttempt._debug(`Successfully parsed attempt: ${attempt.attempt.id}.`);
        return Object.assign(Object.assign({}, attempt), { questions: parsedQuestions });
    }
    /**Returns attempt data as new update object that can be passed to `saveAttempt` or `processAttempt` */
    static toUpdate(attempt) {
        MoodleAttempt._debug(`Converting attempt with id: <${attempt.attempt.id}> to update object...`);
        const questionUpdates = [];
        const questions = attempt.questions;
        for (const question of questions) {
            questionUpdates.push(MoodleQuestion_1.default.toUpdate(question));
        }
        const update = new MoodleAttemptUpdate_1.default(questionUpdates);
        MoodleAttempt._debug(`Successfully converted attempt with id: <${attempt.attempt.id}> to update object.`);
        return update;
    }
    /**Cheats answers from one moodle attempt review and returns new moodle attempt data with solved questions*/
    static cheatFrom(destination, source) {
        if (destination.attempt.quiz !== source.attempt.quiz)
            throw MoodleAttempt._error(`Trying to cheat solution from an attempt of a different quiz.`);
        MoodleAttempt._debug(`Cheating solution from attempt: <${source.attempt.id}>, to attempt: <${destination.attempt.id}>...`);
        const newQuestions = [];
        const destQuestions = destination.questions;
        const sourceQuestions = [...source.questions];
        for (const destQuestion of destQuestions) {
            let matchingQuestion;
            let matchingQIndex;
            for (let i = 0; i < sourceQuestions.length; i++) {
                const sourceQuestion = sourceQuestions[i];
                const match = MoodleQuestion_1.default.match(destQuestion, sourceQuestion);
                if (match) {
                    matchingQuestion = sourceQuestion;
                    matchingQIndex = i;
                    break;
                }
            }
            if (matchingQuestion) {
                sourceQuestions.splice(matchingQIndex, 1);
                const solvedQuestion = MoodleQuestion_1.default.cheatFrom(destQuestion, matchingQuestion, false);
                newQuestions.push(solvedQuestion);
            }
            else {
                MoodleAttempt._debug(`Could not find matching question for question with instance: <${destQuestion.instance}>, cannot cheat answer.`);
                newQuestions.push(destQuestion);
            }
        }
        MoodleAttempt._debug(`Successfully cheated solution from attempt: <${source.attempt.id}>, to attempt: <${destination.attempt.id}>.`);
        return Object.assign(Object.assign({}, destination), { questions: newQuestions });
    }
}
MoodleAttempt._debug = (0, debug_1.default)("moodle:helper:attempt");
exports.default = MoodleAttempt;
