import { useCallback, useState } from "react";
import {
  FetchBodyParser,
  fetcher,
  FetchError,
  FetchMethod,
} from "../helpers/fetcher";
import useNotification from "./useNotification";
import useSWR from "swr";
import useScopedLocale from "./useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "uiForm"];

export type UseFormProps<TInput, TResult = unknown> = {
  path: string | ((input: Partial<TInput>) => string);
  method: FetchMethod;
  parser?: FetchBodyParser;
  successCb?: (result: TResult) => unknown;
  errorCb?: () => unknown;
  hasProblem?: (input: Partial<TInput>) => string | undefined | false | void;
  initMessage?: string;
  errorMessage?: string;
  successMessage?: string;
  decorators?: { [key: string]: unknown };
  mutator?: (inp: Partial<TInput>) => Record<string, unknown>;
};

export type UseFormReturn<TInput> = {
  input: Partial<TInput>;
  setInput: React.Dispatch<React.SetStateAction<Partial<TInput>>>;
  isLoading: boolean;
  submit: () => void;
  reset: () => void;
  // the input differs from what was last saved
  dirty?: boolean;
};

const snapshot = (value: unknown) => {
  try {
    return JSON.stringify(value, (_k, v) => (typeof File !== "undefined" && v instanceof File ? `file:${v.name}:${v.size}` : v));
  } catch {
    return String(Math.random());
  }
};

const useForm = function <TInput, TResult = unknown>({
  method,
  path,
  hasProblem,
  parser = "FORM",
  successCb,
  errorMessage,
  initMessage,
  successMessage,
  decorators = {},
  mutator,
  errorCb,
}: UseFormProps<TInput, TResult>): UseFormReturn<TInput> {
  const [input, setInput] = useState<Partial<TInput>>({});
  // what the last successful save sent: the form is "dirty" while the
  // input differs from it (a switch flipped but never saved looked saved)
  const [savedInput, setSavedInput] = useState<string>("{}");
  const [isSaving, setIsSaving] = useState<Record<string, unknown> | null>(
    null,
  );

  const getContent = useScopedLocale(LOCALE_NS);

  const pushNotification = useNotification();

  useSWR<TResult>(
    isSaving
      ? {
          url: typeof path === "string" ? path : path(input),
          payload: isSaving,
          method,
        }
      : null,
    (args) => fetcher({ ...args, bodyParser: parser }),
    {
      dedupingInterval: 0,
      onSuccess: (data) => {
        setIsSaving(null);
        setSavedInput(snapshot(input));
        pushNotification(
          successMessage || getContent("operationWasSuccessful"),
          "Success",
        );
        successCb?.(data);
      },
      onError: (err) => {
        setIsSaving(null);
        if (errorMessage) pushNotification(errorMessage, "Error");
        if (err instanceof FetchError) pushNotification(err.message, "Error");
        errorCb?.();
      },
    },
  );

  const reset = useCallback(() => setInput({}), []);

  const submit = useCallback(() => {
    if (!!isSaving) return;
    const problem = hasProblem?.(input);
    if (problem) return pushNotification(problem, "Warn");
    if (!!initMessage) pushNotification(initMessage);
    setIsSaving(mutator ? mutator({ ...input }) : { ...input, ...decorators });
  }, [
    decorators,
    hasProblem,
    initMessage,
    input,
    isSaving,
    mutator,
    pushNotification,
  ]);
  const dirty = Object.keys(input).length > 0 && snapshot(input) !== savedInput;
  return { input, setInput, isLoading: !!isSaving, submit, reset, dirty };
};

export default useForm;
