import IMoodleAttempt from './IMoodleAttempt';
import IMoodleQuestion from './IMoodleQuestion';
import IMoodleWSWarning from './IMoodleWSWarning';
export default interface IMoodleAttemptData {
    attempt: IMoodleAttempt;
    messages: unknown[];
    nextpage: number;
    questions: IMoodleQuestion[];
    warnings: IMoodleWSWarning[];
}
