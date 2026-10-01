"use client";

import { useCallback, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher, FetchError } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";

// A NexaMap background job of the super admin (backend Lib/nexamapAdmin.ts:
// the divisions import and the providers' batch geocode). The page polls the
// latest job of its kind while it runs.
export type MapJobKind = "divisions" | "geocode";

export type MapJob<TResult = unknown> = {
  id: string;
  kind: MapJobKind;
  status: "running" | "done" | "failed";
  phase: string;
  total: number;
  processed: number;
  startedAt: string;
  finishedAt?: string;
  error?: { code?: string; message: string };
  options?: Record<string, unknown>;
  result?: TResult;
};

const startPaths: Record<MapJobKind, string> = {
  divisions: `${API}/admin/map/divisions/sync`,
  geocode: `${API}/admin/map/geocode/batch`,
};

const useMapJob = <TResult,>(kind: MapJobKind) => {
  const pushNotification = useNotification();
  const [starting, setStarting] = useState(false);
  const { data, error, mutate } = useSWR<MapJob<TResult> | null>(
    `${API}/admin/map/jobs/${kind}`,
    (url: string) =>
      fetcher({ url }).then((res) => {
        const job = res?.data;
        return job && typeof job === "object" && typeof job.status === "string" ? (job as MapJob<TResult>) : null;
      }),
    {
      refreshInterval: (latest) => (latest?.status === "running" ? 1500 : 0),
    },
  );

  const start = useCallback(
    async (payload: Record<string, unknown>) => {
      if (starting) return;
      setStarting(true);
      try {
        await fetcher({ url: startPaths[kind], method: "POST", payload, bodyParser: "JSON" });
        await mutate();
      } catch (err) {
        if (err instanceof FetchError) pushNotification(err.message, "Error");
      } finally {
        setStarting(false);
      }
    },
    [kind, mutate, pushNotification, starting],
  );

  return {
    job: data ?? null,
    loaded: data !== undefined || !!error,
    error,
    running: data?.status === "running",
    starting,
    start,
    refresh: mutate,
  };
};

export default useMapJob;
