"use client";

import { ReactNode, useContext, useMemo, useState } from "react";
import useSWR from "swr";
import LocaleContext from "./LocaleContext";
import { ITextContent } from "../Admin/TextContent/AdminManageTextContentPage";
import {
  ContentNamespace,
  toNamespacesParam,
} from "../Enums/contentNamespaces";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";

// Provides text content for a set of namespaces and merges it on top of
// whatever an ancestor LocaleScopeProvider already supplied. The root layout
// renders one for the app chrome ("common" + "layoutPanel"); each page/layout
// nests its own on top, fed server-side by getScopedTextContent, so no route
// ever loads the whole TextContent document.
const LocaleScopeProvider = ({
  children,
  namespaces,
  initialTextContent,
}: {
  children: ReactNode;
  namespaces: ContentNamespace[];
  initialTextContent?: Partial<ITextContent>;
}) => {
  const parent = useContext(LocaleContext);
  const [scopedTextContent, setScopedTextContent] = useState<
    Partial<ITextContent>
  >(initialTextContent || {});

  const namespacesParam = useMemo(
    () => toNamespacesParam(namespaces),
    [namespaces],
  );

  // Only hit the client-side SWR fetch if we didn't already get scoped data
  // from the server (SSR) pass.
  // Requests by namespace; the backend resolves them to keys via its
  // mirrored map.
  useSWR<{ textContent?: Partial<ITextContent> }>(
    !Object.keys(scopedTextContent).length && namespacesParam
      ? `${API}/public/site?namespaces=${namespacesParam}`
      : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
    { onSuccess: (data) => setScopedTextContent(data.textContent || {}) },
  );

  const merged = useMemo(
    () => ({ ...parent.textContent, ...scopedTextContent }),
    [parent.textContent, scopedTextContent],
  );

  return (
    <LocaleContext.Provider value={{ textContent: merged }}>
      {children}
    </LocaleContext.Provider>
  );
};

export default LocaleScopeProvider;
