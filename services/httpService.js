"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = void 0;
const request_1 = __importDefault(require("request"));
const get = (uri, options) => {
    return new Promise((resolve, reject) => {
        request_1.default.get(uri, options, (error, res) => {
            if (error)
                reject(error);
            else
                resolve(res);
        });
    });
};
exports.get = get;
