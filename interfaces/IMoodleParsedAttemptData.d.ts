import IMoodleAttemptData from './IMoodleAttemptData';
import IMoodleParsedQuestion from './IMoodleParsedQuestion';
export default interface IMoodleParsedAttemptData extends Omit<IMoodleAttemptData, 'questions'> {
    questions: IMoodleParsedQuestion[];
}
