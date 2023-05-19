import { IMoodleQuestion, IMoodleQuestionUpdate } from '../interfaces';
import { parse, HTMLElement } from 'node-html-parser';
import IMoodleParsedQuestion from '../interfaces/IMoodleParsedQuestion';
import IMoodleQuestionChoice from '../interfaces/IMoodleQuestionChoice';
import MoodleQuestion from './MoodleQuestion';
import { QuestionStates, QuestionTypes } from '../types';
import debug from 'debug';
import IMoodleQuestionSettings from '../interfaces/IMoodleQuestionSettings';

export default abstract class MoodleQShortAnswer {
  private static _debug = debug('moodle:helper:question:shortanswer');

  //TODO: Replace with Custom Error class in the future
  private static _error(message: string) {
    return new Error(message);
  }

  private static _couldNotFind(thing: string) {
    return MoodleQShortAnswer._error(`Could not find ${thing} in HTML data.`);
  }

  private static _parseSettings(settings: string): IMoodleQuestionSettings {
    return JSON.parse(settings) as IMoodleQuestionSettings;
  }

  private static _checkCompatibility(question: IMoodleQuestion) {
    if (question.type !== QuestionTypes.ShortAnswer)
      throw MoodleQShortAnswer._error(
        'Trying to parse a question that is not short answer!'
      );
  }
  private static _extractWritten(parsedHTML: HTMLElement): string | undefined {
    return parsedHTML
      .querySelector('span.answer > input')
      ?.getAttribute('value');
  }

  private static _removeHTML(question: IMoodleQuestion) {
    const noHTMLQuestion: Partial<IMoodleQuestion> = { ...question };
    delete noHTMLQuestion.html;
    return noHTMLQuestion as Required<IMoodleQuestion>;
  }

  private static _extractAnswerFromHTML(parsedHTML: HTMLElement) {
    const answerBoxText = parsedHTML.querySelector('.rightanswer')?.text;
    const answer = /(is|are)[ ]?:[ ]?([\s\S]*)/.exec(answerBoxText ?? '')?.[2];
    if (answer)
      MoodleQShortAnswer._debug(
        `Successfully extracted answer label from HTML, label: <${answer}>.`
      );
    else
      MoodleQShortAnswer._debug(
        `Could not find answer label in HTML, possible bug here.`
      );
    return answer;
  }

  public static parse(question: IMoodleQuestion): IMoodleParsedQuestion {
    MoodleQShortAnswer._debug(
      `Parsing shortanswer question #${question.slot}...`
    );

    MoodleQShortAnswer._checkCompatibility(question);

    const settings = MoodleQShortAnswer._parseSettings(question.settings);

    const parsedHTML = parse(question.html);
    // Accessing 'private' members.
    // Since there is really no such thing as 'private' members in javascript
    const instance: number = MoodleQuestion['_extractInstance'](parsedHTML);
    const text: string = MoodleQuestion['_extractText'](parsedHTML);

    //Only answered questions have a state
    let answer: string | undefined;
    let written: string | undefined;

    written = MoodleQShortAnswer._extractWritten(parsedHTML);

    if (question.state) {
      if (
        question.state === QuestionStates.GradedRight ||
        question.state === QuestionStates.GradedWrong
      ) {
        MoodleQShortAnswer._debug(
          `Question is already graded right, getting the correct answer...`
        );
        answer = MoodleQShortAnswer._extractAnswerFromHTML(parsedHTML);
      }
    } else {
      MoodleQShortAnswer._debug(
        `Question is not graded, cannot extract answer.`
      );

      MoodleQShortAnswer._debug(
        `Successfully parsed multichoice question #${question.slot}...`
      );
    }
    return {
      ...MoodleQShortAnswer._removeHTML(question),
      mark: question.mark ? Number(question.mark) : undefined,
      settings,
      instance,
      text,
      written,
      answer,
    };
  }
}
