import { ContentNamespace } from "../Enums/contentNamespaces";
import { ITextContent } from "../Admin/TextContent/AdminManageTextContentPage";

// No-op kept for existing page files: the root layout now loads every text
// of the current language once (Components/i18n/getMessages).
export const getScopedTextContent = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _namespaces: ContentNamespace[],
): Promise<Partial<ITextContent> | undefined> => undefined;
