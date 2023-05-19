import { IMoodleErrorOptions } from "../interfaces";

export default class MoodleError extends Error {
  exception?: string;
  errorcode?: string;
  debuginfo?: string;
  constructor(options: IMoodleErrorOptions) {
    super(options.message || options.error);
    this.name = "MoodleError";
    this.exception = options.exception ?? "moodle_exception";
    this.errorcode = options.errorcode;
    this.debuginfo = options.debuginfo;
  }
}
