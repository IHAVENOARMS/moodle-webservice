"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MoodleError extends Error {
    constructor(options) {
        var _a;
        super(options.message || options.error);
        this.name = "MoodleError";
        this.exception = (_a = options.exception) !== null && _a !== void 0 ? _a : "moodle_exception";
        this.errorcode = options.errorcode;
        this.debuginfo = options.debuginfo;
    }
}
exports.default = MoodleError;
