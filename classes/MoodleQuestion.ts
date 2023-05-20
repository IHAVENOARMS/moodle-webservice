import { IMoodleQuestion, IMoodleQuestionUpdate } from '../interfaces';
import { QuestionTypes } from '../types';
import { HTMLElement } from 'node-html-parser';
import IMoodleParsedQuestion from '../interfaces/IMoodleParsedQuestion';
import MoodleQMultiChoice from './MoodleQMultiChoice';
import debug from 'debug';
import MoodleQShortAnswer from './MoodleQShortAnswer';
import MoodleQTrueFalse from './MoodleQTrueFalse';

export default abstract class MoodleQuestion {
  private static _debug = debug('moodle:helper:question');

  //TODO: Replace with Custom Error class in the future
  private static _error(message: string) {
    return new Error(message);
  }

  private static _extractText(parsedHTML: HTMLElement) {
    MoodleQuestion._debug(`Extracting question text...`);
    const textElement = parsedHTML.querySelector('.qtext');
    if (!textElement)
      throw MoodleQuestion._error(`Could not find question text.`);
    MoodleQuestion._debug(
      `Successfully extracted question text <${textElement.text}>.`
    );
    return textElement.text;
  }

  private static _extractInstance(parsedHTML: HTMLElement): number {
    MoodleQuestion._debug(`Extracting question instance number...`);
    const couldNotFind = (thing: string) =>
      `Could not find ${thing} in question.`;

    const questionElement = parsedHTML.querySelector('div');
    if (!questionElement)
      throw MoodleQuestion._error(couldNotFind('question element'));

    const htmlId = questionElement.getAttribute('id');
    if (!htmlId) throw MoodleQuestion._error(couldNotFind('htmlId'));

    const idRegex = RegExp(`question-([0-9]*)-[0-9]*`);
    const matchObj = idRegex.exec(htmlId);
    if (!matchObj) throw MoodleQuestion._error(couldNotFind('instance match'));

    const instance: string = matchObj[1];
    if (!instance) throw MoodleQuestion._error(couldNotFind('instance match'));

    MoodleQuestion._debug(
      `Successfully extracted question instance number <${instance}>.`
    );
    return Number(instance);
  }

  public static parseQuestions(questions: IMoodleQuestion[]) {
    const parsedQuestions: IMoodleParsedQuestion[] = [];
    for (const question of questions) {
      const parsedQuestion = MoodleQuestion.parse(question);
      parsedQuestions.push(parsedQuestion);
    }
    return parsedQuestions;
  }

  public static parse(question: IMoodleQuestion): IMoodleParsedQuestion {
    MoodleQuestion._debug(`Parsing question #${question.slot}...`);
    switch (question.type) {
      case QuestionTypes.MultiChoice: {
        MoodleQuestion._debug(
          `Multichoice question detected, passing to multichoice helper...`
        );
        return MoodleQMultiChoice.parse(question);
      }
      case QuestionTypes.ShortAnswer:
        return MoodleQShortAnswer.parse(question);
      case QuestionTypes.TrueFalse:
        return MoodleQTrueFalse.parse(question);
      default:
        return MoodleQMultiChoice.parse(question);
    }
  }

  public static cheatFrom(
    destination: IMoodleParsedQuestion,
    source: IMoodleParsedQuestion,
    checkMatch: boolean = true
  ) {
    if (checkMatch) {
      if (!MoodleQuestion.match(destination, source))
        throw MoodleQuestion._error(
          `Trying to copy answer from question with incompatible type.`
        );
    }
    switch (destination.type) {
      case QuestionTypes.MultiChoice:
        return MoodleQMultiChoice.cheatFrom(destination, source);
      default:
        return MoodleQMultiChoice.cheatFrom(destination, source);
    }
  }

  public static match(
    questionA: IMoodleParsedQuestion,
    questionB: IMoodleParsedQuestion
  ): boolean {
    MoodleQuestion._debug(
      `Matching questions <${questionA.instance}> and <${questionB.instance}>`
    );
    if (questionA.type !== questionB.type) return false;
    switch (questionA.type) {
      case QuestionTypes.MultiChoice:
        MoodleQuestion._debug(
          `Mutlichoice questions detected, passing to multichoice question helper...`
        );
        return MoodleQMultiChoice.match(questionA, questionB);
      default:
        throw MoodleQuestion._error(
          `Unknown question types, cannot match questions.`
        );
    }
  }

  public static toUpdate(
    question: IMoodleParsedQuestion
  ): IMoodleQuestionUpdate {
    MoodleQuestion._debug(`Converting question to update object...`);
    switch (question.type) {
      case QuestionTypes.MultiChoice:
        MoodleQuestion._debug(
          `Multichoice question detected, passing to multichoice helper...`
        );
        return MoodleQMultiChoice.toUpdate(question);
      default:
        throw MoodleQuestion._error(
          `Unknown question type, cannot convert to update object.`
        );
    }
  }
}
