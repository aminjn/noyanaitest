import useNotification from "./useNotification";

export const useClipboard = () => {
  const pushNotification = useNotification();

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
        pushNotification("متن با موفقیت کپی شد", "Success");
      } else {
        pushNotification("خطایی در کپی متن رخ داد", "Error");
      }
    } catch {
      pushNotification("خطایی در کپی متن رخ داد", "Error");
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
      pushNotification("متن با موفقیت کپی شد", "Success");
    } catch {
      pushNotification("خطایی در کپی متن رخ داد", "Error");
    }
  };
  return copyTextToClipboard;
};
