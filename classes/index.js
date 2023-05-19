"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoodleError = exports.MoodleQuestion = exports.MoodleClient = exports.MoodleAttemptUpdate = exports.MoodleAttempt = exports.MoodleApi = void 0;
const MoodleAttempt_1 = __importDefault(require("./MoodleAttempt"));
exports.MoodleAttempt = MoodleAttempt_1.default;
const MoodleAttemptUpdate_1 = __importDefault(require("./MoodleAttemptUpdate"));
exports.MoodleAttemptUpdate = MoodleAttemptUpdate_1.default;
const MoodleClient_1 = __importStar(require("./MoodleClient"));
exports.MoodleApi = MoodleClient_1.default;
Object.defineProperty(exports, "MoodleClient", { enumerable: true, get: function () { return MoodleClient_1.MoodleClient; } });
const MoodleQuestion_1 = __importDefault(require("./MoodleQuestion"));
exports.MoodleQuestion = MoodleQuestion_1.default;
const MoodleError_1 = __importDefault(require("./MoodleError"));
exports.MoodleError = MoodleError_1.default;
