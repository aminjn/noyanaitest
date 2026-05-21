"use client";

import { createContext, ReactNode, useState } from "react";
import { ITextContent } from "../Admin/TextContent/AdminManageTextContentPage";
import useSWR from "swr";
import { ISite } from "@/app/layout";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";

const LocaleContext = createContext<{ textContent: Partial<ITextContent> }>({
  textContent: {},
});

export const LocaleContextProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: { textContent?: ITextContent };
}) => {
  const [textContent, setTextContent] = useState<Partial<ITextContent>>(
    value.textContent || {},
  );

  useSWR<ISite>(
    !Object.keys(textContent).length ? `${API}/public/site` : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
    { onSuccess: (data) => setTextContent(data.textContent || {}) },
  );

  return (
    <LocaleContext.Provider value={{ textContent }}>
      {children}
    </LocaleContext.Provider>
  );
};

export default LocaleContext;
