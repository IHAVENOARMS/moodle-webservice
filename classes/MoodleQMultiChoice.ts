import { IMoodleQuestion, IMoodleQuestionUpdate } from '../interfaces';
import { parse, HTMLElement } from 'node-html-parser';
import IMoodleParsedQuestion from '../interfaces/IMoodleParsedQuestion';
import IMoodleQuestionChoice from '../interfaces/IMoodleQuestionChoice';
import MoodleQuestion from './MoodleQuestion';
import { QuestionStates, QuestionTypes } from '../types';
import debug from 'debug';
import IMoodleQuestionSettings from '../interfaces/IMoodleQuestionSettings';

export default abstract class MoodleQMultiChoice {
  private static _debug = debug('moodle:helper:question:multichoice');

  //TODO: Replace with Custom Error class in the future
  private static _error(message: string) {
    return new Error(message);
  }

  private static _couldNotFind(thing: string) {
    return MoodleQMultiChoice._error(`Could not find ${thing} in HTML data.`);
  }

  private static _removeChoiceNumber(label: string) {
    return label.slice(3);
  }

  private static _extractChoiceLabel(choiceElement: HTMLElement) {
    MoodleQMultiChoice._debug(`Extracting label from choice HTML element...`);
    const labelElement = choiceElement.querySelector(
      'div[data-region="answer-label"]'
    );
    if (!labelElement) throw MoodleQMultiChoice._couldNotFind(`label element`);
    const label = MoodleQMultiChoice._removeChoiceNumber(labelElement.text);
    MoodleQMultiChoice._debug(
      `Successfully extracted label: ${label} from choice HTML element.`
    );
    return label;
  }

  private static _extractChoiceInputElement(choiceElement: HTMLElement) {
    MoodleQMultiChoice._debug(
      `Extracting input element from choice HTML element...`
    );
    const inputElement = choiceElement.querySelector('input[type="radio"]');
    if (!inputElement) throw MoodleQMultiChoice._couldNotFind('input element');
    MoodleQMultiChoice._debug(
      `Successfully extracted input element from choice HTML element.`
    );
    return inputElement;
  }

  private static _extractChoice(choiceElement: HTMLElement) {
    const inputElement =
      MoodleQMultiChoice._extractChoiceInputElement(choiceElement);

    const label: string = MoodleQMultiChoice._extractChoiceLabel(choiceElement);

    const isChosen: boolean =
      inputElement.getAttribute('checked') === 'checked';

    const value: number = Number(inputElement.getAttribute('value'));

    //TODO: Find what images look like and extract them as well.
    const choice: IMoodleQuestionChoice = { label, value };

    return { choice, isChosen };
  }

  private static _extractChoices(parsedHTML: HTMLElement): {
    chosen: number | undefined;
    choices: IMoodleQuestionChoice[];
  } {
    let chosen: number | undefined;
    const choices: IMoodleQuestionChoice[] = [];
    const choiceElements = parsedHTML.querySelectorAll('.answer > div');

    if (choiceElements.length === 0)
      throw MoodleQMultiChoice._couldNotFind('choice elements');

    for (let i = 0; i < choiceElements.length; i++) {
      const choiceElement = choiceElements[i];
      MoodleQMultiChoice._debug(`Extracting choice number: ${i}...`);
      const { choice, isChosen } =
        MoodleQMultiChoice._extractChoice(choiceElement);
      choices.push(choice);
      MoodleQMultiChoice._debug(`Successfully extracted choice number: ${i}.`);

      if (isChosen) {
        MoodleQMultiChoice._debug(`Found selected answer: #${choice.value}.`);
        chosen = choice.value;
      }
    }

    return { choices, chosen };
  }

  private static _extractAnswerFromChoices(
    choices: IMoodleQuestionChoice[],
    chosen: number
  ): IMoodleQuestionChoice {
    const answer = choices.find((choice) => choice.value === chosen)!;
    if (answer) {
      MoodleQMultiChoice._debug(`Successfully retrieved answer from choices.`);
    } else {
      MoodleQMultiChoice._debug(
        `Could not find answer within choices... possible bug here.`
      );
    }
    return answer;
  }

  private static _extractAnswerLabelFromHTML(parsedHTML: HTMLElement) {
    const answerBoxText = parsedHTML.querySelector('.rightanswer')?.text;
    const answer = /(is|are)[ ]?:[ ]?([\s\S]*)/.exec(answerBoxText ?? '')?.[2];
    if (answer)
      MoodleQMultiChoice._debug(
        `Successfully extracted answer label from HTML, label: <${answer}>.`
      );
    else
      MoodleQMultiChoice._debug(
        `Could not find answer label in HTML, possible bug here.`
      );
    return answer;
  }

  private static _parseSettings(settings: string): IMoodleQuestionSettings {
    return JSON.parse(settings) as IMoodleQuestionSettings;
  }

  private static _checkCompatibility(question: IMoodleQuestion) {
    if (
      !(
        question.type === QuestionTypes.MultiChoice ||
        question.type === QuestionTypes.TrueFalse
      )
    )
      throw MoodleQMultiChoice._error(
        'Trying to parse a question that is not multichoice!'
      );
  }

  private static _removeHTML(question: IMoodleQuestion) {
    const noHTMLQuestion: Partial<IMoodleQuestion> = { ...question };
    delete noHTMLQuestion.html;
    return noHTMLQuestion as Required<IMoodleQuestion>;
  }

  public static toUpdate(
    question: IMoodleParsedQuestion
  ): IMoodleQuestionUpdate {
    const answer = (question.answer as IMoodleQuestionChoice)?.value;
    MoodleQMultiChoice._debug(
      `Successfully converted multichoice question <${question.instance}> to update object.`
    );
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
  public static cheatFrom(
    destination: IMoodleParsedQuestion,
    source: IMoodleParsedQuestion
  ): IMoodleParsedQuestion {
    for (const destChoice of destination.choices!) {
      const typedAnswer = source.answer as IMoodleQuestionChoice;
      if (destChoice.label === typedAnswer.label) {
        return {
          ...destination,
          chosen: destChoice.value,
          answer: {
            label: typedAnswer.label,
            value: destChoice.value,
          },
        };
      }
    }
    return destination;
  }

  public static match(
    questionA: IMoodleParsedQuestion,
    questionB: IMoodleParsedQuestion
  ): boolean {
    //TODO: find a stricter criteria for finding matching questions.
    MoodleQMultiChoice._debug(
      `Matching multichoice questions <${questionA.instance}:${questionA.slot}> and <${questionB.instance}:${questionB.slot}>...`
    );
    const match = questionA.text === questionB.text;
    MoodleQMultiChoice._debug(
      match
        ? `Questions <${questionA.instance}:${questionA.slot}> and <${questionB.instance}:${questionB.slot}> match!`
        : `Questions <${questionA.instance}:${questionA.slot}> and <${questionB.instance}:${questionB.slot}> do not match.`
    );
    return match;
  }

  public static parse(question: IMoodleQuestion): IMoodleParsedQuestion {
    MoodleQMultiChoice._debug(
      `Parsing multichoice question #${question.slot}...`
    );

    MoodleQMultiChoice._checkCompatibility(question);

    const settings = MoodleQMultiChoice._parseSettings(question.settings);

    const parsedHTML = parse(question.html);
    // Accessing 'private' members.
    // Since there is really no such thing as 'private' members in javascript
    const instance: number = MoodleQuestion['_extractInstance'](parsedHTML);
    const text: string = MoodleQuestion['_extractText'](parsedHTML);

    const { choices, chosen } = MoodleQMultiChoice._extractChoices(parsedHTML);

    //Only answered questions have a state
    let answer: IMoodleQuestionChoice | undefined;

    if (question.state) {
      switch (question.state) {
        case QuestionStates.GradedRight:
          MoodleQMultiChoice._debug(
            `Question is already graded right, getting the chosen answer...`
          );
          answer = MoodleQMultiChoice._extractAnswerFromChoices(
            choices,
            chosen!
          );
          break;
        default:
          MoodleQMultiChoice._debug(
            `Question is graded wrong or given up on, extracting answer from HTML...`
          );
          const answerLabel =
            MoodleQMultiChoice._extractAnswerLabelFromHTML(parsedHTML);
          const answerValue = choices.find(
            (choice) => choice.label === answerLabel
          )?.value;
          if (answerValue)
            MoodleQMultiChoice._debug(
              `Succesfully extracted answer value from HTML, value: <${answerValue}>.`
            );
          else
            MoodleQMultiChoice._debug(
              `Could not extract answer value from HTML, possible bug here.`
            );
          answer = { label: answerLabel, value: answerValue! };
          break;
      }
    } else
      MoodleQMultiChoice._debug(
        `Question is not graded, cannot extract answer.`
      );

    MoodleQMultiChoice._debug(
      `Successfully parsed multichoice question #${question.slot}...`
    );

    return {
      ...MoodleQMultiChoice._removeHTML(question),
      mark: question.mark ? Number(question.mark) : undefined,
      settings,
      instance,
      text,
      choices,
      chosen,
      answer,
    };
  }
}
