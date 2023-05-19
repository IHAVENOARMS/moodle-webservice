import { IMoodleAttemptData, IMoodleAttemptReview } from "../interfaces";
import IMoodleParsedAttemptData from "../interfaces/IMoodleParsedAttemptData";
import IMoodleParsedAttemptReview from "../interfaces/IMoodleParsedAttemptReview";
import MoodleAttemptUpdate from "./MoodleAttemptUpdate";
export default abstract class MoodleAttempt {
    private static _debug;
    private static _error;
    static parse(attemptData: IMoodleAttemptData): IMoodleParsedAttemptData;
    static parse(attemptReview: IMoodleAttemptReview): IMoodleParsedAttemptReview;
    /**Returns attempt data as new update object that can be passed to `saveAttempt` or `processAttempt` */
    static toUpdate(attempt: IMoodleParsedAttemptData | IMoodleParsedAttemptReview): MoodleAttemptUpdate;
    /**Cheats answers from one moodle attempt review and returns new moodle attempt data with solved questions*/
    static cheatFrom(destination: IMoodleParsedAttemptData, source: IMoodleParsedAttemptReview): IMoodleParsedAttemptData;
}
