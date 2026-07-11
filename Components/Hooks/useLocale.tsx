import { useCallback, useContext } from "react";
import { ContentKey } from "../Enums/contentKeys";
import LocaleContext from "../Store/LocaleContext";

const useLocale = () => {
  const { textContent } = useContext(LocaleContext);
  const getContent = useCallback(
    (key: ContentKey, vars?: string[]) => {
      let result = textContent[key] === undefined ? key : textContent[key];
      for (let i = 0; i < (vars || []).length; ++i)
        result = result.replaceAll(
          "$" + "{" + (i + 1).toString() + "}",
          (vars || [])[i],
        );
      return result;
    },
    [textContent],
  );
  return getContent;
};

export default useLocale;
