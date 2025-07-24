import { useCallback, useContext } from "react";
import { ContentKey } from "../Enums/contentKeys";
import LocaleContext from "../Store/LocaleContext";

const useLocale = () => {
  const { textContent } = useContext(LocaleContext);
  const getContent = useCallback(
    (key: ContentKey) =>
      textContent[key] === undefined ? key : textContent[key],
    [textContent]
  );
  return getContent;
};

export default useLocale;
