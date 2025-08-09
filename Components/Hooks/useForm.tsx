import { useCallback, useState } from "react";
import {
  FetchBodyParser,
  fetcher,
  FetchError,
  FetchMethod,
} from "../helpers/fetcher";
import useNotification from "./useNotification";
import useSWR from "swr";

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
  const [isSaving, setIsSaving] = useState<Record<string, unknown> | null>(
    null
  );
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
        if (successMessage) pushNotification(successMessage, "Success");
        successCb?.(data);
      },
      onError: (err) => {
        setIsSaving(null);
        if (errorMessage) pushNotification(errorMessage, "Error");
        if (err instanceof FetchError) pushNotification(err.message, "Error");
        errorCb?.();
      },
    }
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
  return { input, setInput, isLoading: !!isSaving, submit, reset };
};

export default useForm;
