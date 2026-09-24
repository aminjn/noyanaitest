import { getPublicData } from "./getPublicData";
import {
  ContentNamespace,
  toNamespacesParam,
} from "../Enums/contentNamespaces";
import { ITextContent } from "../Admin/TextContent/AdminManageTextContentPage";

// Server-side fetch of only the text content a page needs, by namespace (see
// contentNamespaces.tsx). Hits /public/site with a `namespaces` query param —
// the backend keeps a mirrored namespace map (noyanai-back/Lib/
// contentNamespaces.ts) and resolves the names to the keys to select.
//
// "common" doesn't need to be requested by pages: app/layout.tsx fetches it
// (plus the panel chrome's "layoutPanel") once, server-side, for the header/
// footer/sidebars, and every page's LocaleScopeProvider inherits it.
export const getScopedTextContent = async (
  namespaces: ContentNamespace[],
): Promise<Partial<ITextContent> | undefined> => {
  const param = toNamespacesParam(namespaces);
  if (!param) return undefined;
  const site = await getPublicData<{ textContent?: Partial<ITextContent> }>(
    "site",
    { namespaces: param },
  );
  return site?.textContent;
};
