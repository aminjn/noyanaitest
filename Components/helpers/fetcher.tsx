const fetchMethods = ["GET", "POST", "PATCH", "PUT", "DELETE"] as const;
export type FetchMethod = (typeof fetchMethods)[number];

const fetchBodyParsers = ["JSON", "FORM"] as const;
export type FetchBodyParser = (typeof fetchBodyParsers)[number];

export type FethcerArgs = {
  url: string;
  method?: FetchMethod;
  payload?: { [key: string]: unknown };
  bodyParser?: FetchBodyParser;
  headers?: Record<string, string>;
};

export class FetchError extends Error {
  status;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

const fetcherInner = async <TResult,>({
  url,
  method,
  payload,
  bodyParser = "JSON",
  headers: _headers = {},
}: FethcerArgs): Promise<TResult> => {
  let body: undefined | FormData | string;
  const headers: Record<string, string> = { ..._headers };
  if (payload) {
    switch (bodyParser) {
      case "JSON": {
        body = JSON.stringify(payload);
        break;
      }
      case "FORM": {
        body = new FormData();
        for (const key in payload) {
          const value = payload[key];
          if (typeof value !== "undefined") {
            if (typeof value === "string") {
              body.append(key, value);
            } else if (value instanceof File) {
              body.append(key, value);
            } else if (value instanceof Date) {
              body.append(key, value.toString());
            } else {
              body.append(key, JSON.stringify(value));
            }
          }
        }
        break;
      }
    }
  }
  if (bodyParser === "JSON") headers["content-type"] = "application/json";
  const response = await fetch(url, {
    credentials: "include",
    method,
    headers,
    body,
  });
  if (!response.headers.get("content-type")?.includes("json"))
    throw new FetchError("جواب دریافت شده از سرور معتبر نیست", response.status);
  const data = await response.json();
  if (!response.ok)
    throw new FetchError(
      data.message || "خطای ناشناخته رخ داده",
      response.status
    );
  return data;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetcher = <TResult = any,>(args: FethcerArgs) =>
  fetcherInner<TResult>(args).then((res) => res);
