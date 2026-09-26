import useNotification from "./useNotification";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";

export const useClipboard = () => {
  const pushNotification = useNotification();
  const getContent = useScopedLocale();

  function fallbackCopyTextToClipboard(text: string) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand("copy");
      if (successful) {
        pushNotification(getContent("textCopiedSuccessfully"), "Success");
      } else {
        pushNotification(getContent("copyTextError"), "Error");
      }
    } catch {
      pushNotification(getContent("copyTextError"), "Error");
    }
    document.body.removeChild(textArea);
  }

  const copyTextToClipboard = async (text: string) => {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      pushNotification(getContent("textCopiedSuccessfully"), "Success");
    } catch {
      pushNotification(getContent("copyTextError"), "Error");
    }
  };
  return copyTextToClipboard;
};
