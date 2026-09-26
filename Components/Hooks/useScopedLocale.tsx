import { ContentNamespace } from "../Enums/contentNamespaces";
import useLocale from "./useLocale";

// Kept for the existing call sites: every text of the current language is
// already in LocaleContext (loaded once by the root layout), so the
// namespaces argument no longer matters.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useScopedLocale = (_namespaces?: ContentNamespace[]) => useLocale();

export default useScopedLocale;
