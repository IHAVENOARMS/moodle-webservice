import { IMoodleErrorOptions } from "../interfaces";
export default class MoodleError extends Error {
    exception?: string;
    errorcode?: string;
    debuginfo?: string;
    constructor(options: IMoodleErrorOptions);
}
