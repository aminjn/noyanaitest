"use client";

import { ReactNode, useContext, useMemo, useState } from "react";
import useSWR from "swr";
import LocaleContext from "./LocaleContext";
import { ITextContent } from "../Admin/TextContent/AdminManageTextContentPage";
import { ContentNamespace, getNamespaceKeys } from "../Enums/contentNamespaces";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";

// Nests inside the existing LocaleContext (populated at the root layout with
// the *entire* textContent, unchanged) and layers a smaller, page-scoped
// fetch on top of it.
//
// Why merge instead of replace: the root layout's LocaleContextProvider
// still supplies everything today, so every page/component that hasn't been
// migrated to a namespace keeps working exactly as before, reading whatever
// it needs off the inherited context. This provider only *adds* the scoped
// keys on top (a no-op in practice right now, since the parent already has
// them). Once a page's namespace covers everything it needs, the root fetch
// can eventually be narrowed for that route without this component or the
// page's useLocale() calls needing to change at all.
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

  const keys = useMemo(() => getNamespaceKeys(namespaces), [namespaces]);

  // Same pattern as LocaleContextProvider: only hit the client-side SWR
  // fetch if we didn't already get scoped data from the server (SSR) pass.
  useSWR<{ textContent?: Partial<ITextContent> }>(
    !Object.keys(scopedTextContent).length && keys.length
      ? `${API}/public/site?keys=${keys.join(",")}`
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
