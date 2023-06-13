import request from "request";

export const get = (uri: string, options: request.CoreOptions) => {
  return new Promise<request.Response>((resolve, reject) => {
    request.get(
      uri,
      options,
      (error, res) => {
        if (error) reject(error);
        else resolve(res);
      },
    );
  });
};
