"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MoodleAttemptUpdate {
    constructor(updates) {
        for (let i = 0; i < updates.length; i++) {
            const update = updates[i];
            this._loadUpdate(update);
        }
    }
    _loadUpdate(update) {
        if (update.answer !== undefined) {
            this[`q${update.instance}:${update.slot}_answer`] = update.answer;
            if (update.sequencecheck === undefined)
                throw new Error(`No sequence check provided for answer update question: ${update.instance}`);
            this[`q${update.instance}:${update.slot}_:sequencecheck`] =
                update.sequencecheck;
        }
        if (update.flagged !== undefined)
            this[`q${update.instance}:${update.slot}_:flagged`] = update.flagged;
    }
}
exports.default = MoodleAttemptUpdate;
