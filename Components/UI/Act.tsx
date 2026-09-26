import useSWR from "swr";
import { useEffect } from "react";
import {
  FetchBodyParser,
  fetcher,
  FetchError,
  FetchMethod,
} from "../helpers/fetcher";
import useNotification from "../Hooks/useNotification";
const Act = <TResult,>({
  path,
  payload,
  method,
  onDone,
  errorMessage,
  initMessage,
  successMessage,
  parser,
}: {
  payload?: { [key: string]: unknown };
  method?: FetchMethod;
  path: string | null;
  errorMessage?: string;
  successMessage?: string;
  initMessage?: string;
  onDone: (status: boolean, result?: TResult) => void;
  parser?: FetchBodyParser;
}) => {
  const pushNotification = useNotification();

  useEffect(() => {
    if (path && initMessage) pushNotification(initMessage);
  }, [initMessage, path, pushNotification]);

  useSWR<TResult>(
    path ? { url: path, payload, method } : null,
    (args) => fetcher({ ...args, bodyParser: parser }),
    {
      dedupingInterval: 0,
      // Act fires one-off mutations (POST/PUT/DELETE...). Never re-run them
      // on window focus, reconnect or error retry - that re-sent requests
      // like migrations and refreshes while they were still pending.
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      onSuccess: (data) => {
        if (successMessage) pushNotification(successMessage, "Success");
        onDone(true, data);
      },
      onError: (err) => {
        if (errorMessage) pushNotification(errorMessage, "Error");
        if (err instanceof FetchError) pushNotification(err.message, "Error");
        onDone(false);
      },
    },
  );
  return null;
};

export default Act;
