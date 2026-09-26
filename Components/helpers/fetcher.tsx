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

// Fallback error texts for when the server gives no usable message. This is
// not a React component, so the language is read from <html lang>.
const fallbackErrorMessages: Record<
  string,
  { invalidResponse: string; unknownError: string }
> = {
  fa: {
    invalidResponse: "جواب دریافت شده از سرور معتبر نیست",
    unknownError: "خطای ناشناخته رخ داده",
  },
  en: {
    invalidResponse: "The response received from the server is invalid",
    unknownError: "An unknown error occurred",
  },
  ar: {
    invalidResponse: "الاستجابة المستلمة من الخادم غير صالحة",
    unknownError: "حدث خطأ غير معروف",
  },
  zh: {
    invalidResponse: "服务器返回的响应无效",
    unknownError: "发生未知错误",
  },
  hi: {
    invalidResponse: "सर्वर से प्राप्त प्रतिक्रिया मान्य नहीं है",
    unknownError: "एक अज्ञात त्रुटि हुई",
  },
  es: {
    invalidResponse: "La respuesta recibida del servidor no es válida",
    unknownError: "Se produjo un error desconocido",
  },
  fr: {
    invalidResponse: "La réponse reçue du serveur n'est pas valide",
    unknownError: "Une erreur inconnue s'est produite",
  },
  ru: {
    invalidResponse: "Получен недопустимый ответ от сервера",
    unknownError: "Произошла неизвестная ошибка",
  },
  pt: {
    invalidResponse: "A resposta recebida do servidor não é válida",
    unknownError: "Ocorreu um erro desconhecido",
  },
  de: {
    invalidResponse: "Die vom Server erhaltene Antwort ist ungültig",
    unknownError: "Ein unbekannter Fehler ist aufgetreten",
  },
  tr: {
    invalidResponse: "Sunucudan alınan yanıt geçersiz",
    unknownError: "Bilinmeyen bir hata oluştu",
  },
  ur: {
    invalidResponse: "سرور سے موصول ہونے والا جواب درست نہیں ہے",
    unknownError: "ایک نامعلوم خرابی پیش آئی",
  },
  bn: {
    invalidResponse: "সার্ভার থেকে প্রাপ্ত প্রতিক্রিয়া বৈধ নয়",
    unknownError: "একটি অজানা ত্রুটি ঘটেছে",
  },
  id: {
    invalidResponse: "Respons yang diterima dari server tidak valid",
    unknownError: "Terjadi kesalahan yang tidak diketahui",
  },
  ja: {
    invalidResponse: "サーバーから無効な応答を受信しました",
    unknownError: "不明なエラーが発生しました",
  },
};

const getFallbackErrorMessages = () => {
  const lang =
    typeof document !== "undefined"
      ? document.documentElement.lang.split("-")[0].toLowerCase()
      : "";
  return fallbackErrorMessages[lang] ?? fallbackErrorMessages.fa;
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
  // Current UI language (set on <html lang> by the root layout), so the
  // backend can answer in it - error messages, translated content.
  if (typeof document !== "undefined" && document.documentElement.lang)
    headers["x-locale"] ??= document.documentElement.lang;
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
            } else if (Array.isArray(value) && value[0] instanceof File) {
              for (let i = 0; i < value.length; ++i) {
                if (value[i] instanceof File) body.append(key, value[i]);
              }
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
    throw new FetchError(
      getFallbackErrorMessages().invalidResponse,
      response.status
    );
  const data = await response.json();
  if (!response.ok)
    throw new FetchError(
      data.message || getFallbackErrorMessages().unknownError,
      response.status
    );
  return data;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetcher = <TResult = any,>(args: FethcerArgs) =>
  fetcherInner<TResult>(args).then((res) => res);
