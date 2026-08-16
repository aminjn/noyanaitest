import { getPublicData } from "./getPublicData";
import {
  ContentNamespace,
  getNamespaceKeys,
} from "../Enums/contentNamespaces";
import { ITextContent } from "../Admin/TextContent/AdminManageTextContentPage";

// Server-side fetch of only the text content keys a page needs, resolved
// from one or more namespaces (see contentNamespaces.tsx). Hits the same
// /public/site endpoint as the full sitewide fetch, just with a `keys` query
// param so the backend can project down to a subset instead of returning
// everything.
export const getScopedTextContent = async (
  namespaces: ContentNamespace[],
): Promise<Partial<ITextContent> | undefined> => {
  const keys = getNamespaceKeys(namespaces);
  if (!keys.length) return undefined;
  const site = await getPublicData<{ textContent?: Partial<ITextContent> }>(
    "site",
    { keys: keys.join(",") },
  );
  return site?.textContent;
};
