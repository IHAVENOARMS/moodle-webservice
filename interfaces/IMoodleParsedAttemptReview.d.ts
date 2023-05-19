import IMoodleAttemptReview from './IMoodleAttemptReview';
import IMoodleParsedQuestion from './IMoodleParsedQuestion';
export default interface IMoodleParsedAttemptReview extends Omit<IMoodleAttemptReview, 'questions'> {
    questions: IMoodleParsedQuestion[];
}
