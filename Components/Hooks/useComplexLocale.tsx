import { useCallback } from "react";
import useLocale from "./useLocale";
import { ContentKey } from "../Enums/contentKeys";

const useComplexLocale = () => {
  const getContent = useLocale();
  const getComplexContent = useCallback<
    (contentKey: ContentKey, vars: string[]) => string
  >(
    (contentKey, vars) => {
      let result = getContent(contentKey);
      for (let i = 0; i < vars.length; ++i)
        result = result.replaceAll(
          "$" + "{" + (i + 1).toString() + "}",
          vars[i]
        );
      return result;
    },
    [getContent]
  );
  return getComplexContent;
};

export default useComplexLocale;
