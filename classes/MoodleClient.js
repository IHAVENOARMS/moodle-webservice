"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoodleClient = void 0;
const os_1 = __importDefault(require("os"));
const url_1 = require("url");
const httpService_1 = require("../services/httpService");
const debug_1 = __importDefault(require("debug"));
//Load package info
const package_json_1 = __importDefault(require("../package.json"));
const MoodleError_1 = __importDefault(require("./MoodleError"));
//Load function definitions
const functions_json_1 = __importDefault(require("../api/functions.json"));
const definition = functions_json_1.default;
class MoodleClient {
    constructor(options) {
        this.options = options;
        //Check the URL syntax
        if (!/^https?:\/\//g.test(options.baseUrl)) {
            throw new Error("Argument 'options.baseUrl' must be a URL string.");
        }
        //Check the URL syntax
        if (options.baseUrl.includes("server.php")) {
            throw new Error("Argument 'options.baseUrl' should NOT contain the complete URL. Hint: provide base URL such as https://mooodle.example.com");
        }
        this._loadApi();
        //Sanitize base URL - trim trailing slash
        options.baseUrl = options.baseUrl.trim().replace(/\/$/g, "");
    }
    _loadApi() {
        //Store definition into the instance
        this._definition = definition;
        //List of generated functions
        this._functions = [];
        //Bind Moodle Web Service functions, e.g. core_user_create_users => core.user.createUsers()
        this.api = { config: { token: this.options.token } };
        const client = this;
        const api = this.api;
        for (let item of this._definition.items) {
            //Create a new module
            if (!api[item.module]) {
                api[item.module] = {};
            }
            //Create a new facility
            if (!api[item.module][item.facility]) {
                api[item.module][item.facility] = {};
            }
            //Create a new function
            if (!api[item.module][item.facility][item.preferName]) {
                this._functions.push(item.module + "." + item.facility + "." + item.preferName);
                api[item.module][item.facility][item.preferName] = function (params) {
                    return client._request(item, params);
                };
            }
        }
    }
    static _buildUserAgent() {
        return (package_json_1.default.name +
            "/" +
            package_json_1.default.version +
            " (node.js " +
            process.version +
            "; " +
            os_1.default.platform() +
            " " +
            os_1.default.release() +
            ")");
    }
    get userAgent() {
        //Build User-Agent string
        let userAgent = this.options.userAgent;
        if (!userAgent)
            userAgent = MoodleClient._buildUserAgent();
        return userAgent;
    }
    static flatten(data) {
        let result = {};
        function dig(d, prefix) {
            if (typeof d === "string" || typeof d === "number") {
                result[prefix] = d;
                return;
            }
            for (let key in d) {
                let item = d[key];
                if (item === null) {
                    continue;
                }
                else if (item instanceof Array) {
                    for (var i = 0; i < item.length; i++) {
                        dig(item[i], prefix.length === 0
                            ? prefix + key + "[" + i + "]" //Root level has no square brackets
                            : prefix + "[" + key + "][" + i + "]");
                    }
                }
                else if (typeof item === "object") {
                    for (let i in item) {
                        dig(item, prefix + key + "[" + i + "]");
                    }
                }
                else {
                    result[prefix + "[" + key + "]"] = item;
                }
            }
        }
        dig(data, "");
        return result;
    }
    static authenticate({ baseUrl, credentials, userAgent, httpsAgent, }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let options;
            // if (!payload.body) {
            //No data to be sent
            options = {
                method: "GET",
                headers: {
                    "User-Agent": userAgent !== null && userAgent !== void 0 ? userAgent : MoodleClient._buildUserAgent(),
                    Accept: "application/json",
                    "Accept-Encoding": "gzip, deflate, br",
                },
                agent: httpsAgent,
                json: true,
                rejectUnauthorized: false,
                strictSSL: false
            };
            let form = new url_1.URLSearchParams(Object.assign(Object.assign({}, credentials), { service: (_a = credentials === null || credentials === void 0 ? void 0 : credentials.service) !== null && _a !== void 0 ? _a : "moodle_mobile_app" }));
            let url = baseUrl + "login/token.php?" + form;
            const result = (yield (0, httpService_1.get)(url, options)).body;
            if (typeof result.error === "string") {
                throw new MoodleError_1.default(result);
            }
            return result;
        });
    }
    static _format(data) {
        const moodleData = [];
        for (const key of Object.keys(data)) {
            const currentItem = data[key];
            if (currentItem instanceof Array) {
                for (const value of currentItem) {
                    moodleData.push({ name: key, value: `${value}` });
                }
            }
            else {
                moodleData.push({ name: key, value: data[key] });
            }
        }
        return { data: moodleData };
    }
    static _prepareParams(params) {
        let finalParams;
        finalParams = Object.assign({}, params);
        delete finalParams.token; //Getting rid of the token
        for (const key of Object.keys(params)) {
            const item = finalParams[key];
            if (item instanceof Array) {
                delete finalParams[key];
                finalParams = Object.assign(Object.assign({}, finalParams), MoodleClient.flatten({ [key]: item }));
            }
        }
        if (finalParams.data) {
            finalParams = Object.assign(Object.assign({}, finalParams), MoodleClient.flatten(MoodleClient._format(params.data)));
        }
        return new url_1.URLSearchParams(finalParams);
    }
    _request(item, params) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            let fnDebugger;
            try {
                //Get web service functio name
                let wsfunction = null;
                wsfunction = item.name;
                fnDebugger = (0, debug_1.default)(`moodle:api:${item.module}:${item.facility}`);
                fnDebugger(`Calling ${item.preferName}...`);
                //Verify if function name is set
                if (!wsfunction || wsfunction.length === 0) {
                    throw new Error("Web Service function not defined: " + item);
                }
                //Build request options
                let options = null;
                //No data to be sent
                options = {
                    method: "GET",
                    headers: {
                        "User-Agent": this.userAgent,
                        Accept: "application/json",
                        "Accept-Encoding": "gzip, deflate, br",
                    },
                    agent: this.options.httpsAgent,
                    json: true,
                    rejectUnauthorized: false,
                    strictSSL: false,
                };
                let form = "";
                if (params)
                    form = MoodleClient._prepareParams(params);
                //Complete the URL
                let url = this.options.baseUrl +
                    "/webservice/rest/server.php?wstoken=" +
                    ((_b = (_a = params === null || params === void 0 ? void 0 : params.token) !== null && _a !== void 0 ? _a : this.api.config.token) !== null && _b !== void 0 ? _b : "") +
                    "&moodlewsrestformat=json&wsfunction=" +
                    wsfunction +
                    "&" +
                    form;
                //Make a HTTP request
                const result = (yield (0, httpService_1.get)(url, options)).body;
                //Moodle always returns HTTP status code 200
                //Error can be detected by object properties
                if (typeof result.exception === "string") {
                    throw new MoodleError_1.default(result);
                }
                //Success
                fnDebugger(`Successfully called ${item.preferName} with parameters: ${(_c = JSON.stringify(params)) !== null && _c !== void 0 ? _c : "null"}.`);
                resolve(result);
            }
            catch (err) {
                fnDebugger(`Failed to call ${item.preferName} with parameters: ${JSON.stringify(params)}.`);
                reject(err);
            }
        }));
    }
}
exports.MoodleClient = MoodleClient;
const MoodleApi = (options) => {
    return new MoodleClient(options).api;
};
exports.default = MoodleApi;
