import { useCallback } from "react";
import useScopedLocale from "../Hooks/useScopedLocale";
import { useIntlLocale } from "../i18n/navigation";

// a post's reading time in the reader's language: computed minutes from the
// backend (Models/Blog.ts readMinutes), else the old hand-typed text
const useReadTime = () => {
  const getContent = useScopedLocale(["common"]);
  const intl = useIntlLocale();
  return useCallback(
    (node?: { readMinutes?: number; readTime?: string } | null) => {
      const minutes = Number(node?.readMinutes);
      if (Number.isFinite(minutes) && minutes > 0)
        return getContent("xMinutes", [new Intl.NumberFormat(intl).format(minutes)]);
      return node?.readTime || "";
    },
    [getContent, intl],
  );
};

export default useReadTime;
