import { useCallback, useContext, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { ContentKey } from "../Enums/contentKeys";
import {
  ContentNamespace,
  contentNamespaces,
  getNamespaceKeys,
  toNamespacesParam,
} from "../Enums/contentNamespaces";
import { ITextContent } from "../Admin/TextContent/AdminManageTextContentPage";
import LocaleContext from "../Store/LocaleContext";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { reportMissingContentKey } from "../helpers/reportMissingContentKey";

// Same shape/usage as useLocale() — call it, get a getContent(key, vars)
// function back — but scoped to one or more namespaces (see
// Components/Enums/contentNamespaces.tsx) instead of reading only what an
// ancestor LocaleContext already provided.
//
// Unlike LocaleScopeProvider (which wraps a whole page and fetches all of
// its namespace's keys up front, ideally server-side), this hook is
// component-local: it looks at whatever's already in context (any ancestor
// LocaleScopeProvider, incl. the root layout's "common"/"layoutPanel") and
// only fetches the namespaces that still have missing keys. That makes it safe
// to drop into any single component as-is, with or without a
// LocaleScopeProvider above it, and it naturally does less work as more of
// the tree gets migrated to namespaces.
//
// Trade-off vs. the provider: this fetch happens client-side after mount,
// so on a cold cache a key can render as its raw key name for a moment
// before swapping to real text. The provider avoids that by fetching
// server-side. Use whichever fits the component.
const useScopedLocale = (namespaces: ContentNamespace[]) => {
  const { textContent: inherited } = useContext(LocaleContext);

  const keys = useMemo(() => getNamespaceKeys(namespaces), [namespaces]);

  // Only request the namespaces that still have at least one key missing
  // from context. The backend resolves namespace names to keys via its
  // mirrored map (noyanai-back/Lib/contentNamespaces.ts).
  const missingNamespacesParam = useMemo(
    () =>
      toNamespacesParam(
        namespaces.filter((ns) =>
          (contentNamespaces[ns] as readonly ContentKey[]).some(
            (key) => inherited[key] === undefined,
          ),
        ),
      ),
    [namespaces, inherited],
  );

  const [fetchedTextContent, setFetchedTextContent] = useState<
    Partial<ITextContent>
  >({});

  useSWR<{ textContent?: Partial<ITextContent> }>(
    missingNamespacesParam
      ? `${API}/public/site?namespaces=${missingNamespacesParam}`
      : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
    {
      onSuccess: (data) =>
        setFetchedTextContent((prev) => ({ ...prev, ...data.textContent })),
    },
  );

  const textContent = useMemo(
    () => ({ ...inherited, ...fetchedTextContent }),
    [inherited, fetchedTextContent],
  );

  // Dev-only observer: tracks which (reason, key) pairs have already been
  // reported this mount so re-renders don't spam the backend with the same
  // finding over and over.
  const reportedRef = useRef<Set<string>>(new Set());

  const getContent = useCallback(
    (key: ContentKey, vars?: string[]) => {
      const value = textContent[key];
      let result = value === undefined ? key : value;
      for (let i = 0; i < (vars || []).length; ++i)
        result = result.replaceAll(
          "$" + "{" + (i + 1).toString() + "}",
          (vars || [])[i],
        );

      if (process.env.NODE_ENV === "development") {
        // Two things worth flagging while migrating pages to namespaces:
        // 1. This component asked for a key its declared namespace(s)
        //    don't actually list — it only renders if some ancestor
        //    provider happens to have loaded it.
        // 2. The key resolved to nothing at all — missing on the backend
        //    TextContent document, independent of namespaces.
        const notInNamespace = !keys.includes(key);
        const noValue = value === undefined;
        if (notInNamespace || noValue) {
          const reason = notInNamespace ? "not-in-namespace" : "no-value";
          const dedupeKey = `${reason}:${key}`;
          if (!reportedRef.current.has(dedupeKey)) {
            reportedRef.current.add(dedupeKey);
            reportMissingContentKey({ key, namespaces, reason });
          }
        }
      }

      return result;
    },
    [textContent, keys, namespaces],
  );

  return getContent;
};

export default useScopedLocale;
