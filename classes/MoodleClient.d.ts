import { IMoodleClientOptions, IMoodleWSAPI } from "../interfaces";
import IMoodleWSAuthResponse from "../interfaces/IMoodleWSAuthResponse";
interface IExtMoodleWSAPI extends IMoodleWSAPI {
    [k: string]: any;
}
type AnyObject = {
    [key: string]: any;
};
export declare class MoodleClient {
    options: IMoodleClientOptions;
    private _definition?;
    private _functions?;
    api: IExtMoodleWSAPI;
    constructor(options: IMoodleClientOptions);
    private _loadApi;
    private static _buildUserAgent;
    get userAgent(): string;
    static flatten(data: any): AnyObject;
    static authenticate({ baseUrl, credentials, userAgent, }: Omit<IMoodleClientOptions, "token">): Promise<IMoodleWSAuthResponse>;
    private static _format;
    private static _prepareParams;
    private _request;
}
declare const MoodleApi: (options: Omit<IMoodleClientOptions, "credentials">) => IExtMoodleWSAPI;
export default MoodleApi;
