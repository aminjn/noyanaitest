"use client";
import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

export type SetPopup = (popup: ReactNode) => void;

const PopupContext = createContext<{
  popup: ReactNode | null;
  setPopup: SetPopup;
  closePopup: () => void;
}>({
  closePopup: () => {},
  popup: null,
  setPopup: () => {},
});

export const PopupContextProvider = ({ children }: { children: ReactNode }) => {
  const [popup, setPopup] = useState<ReactNode | null>(null);

  const closePopup = useCallback(() => {
    setPopup(null);
  }, []);

  useEffect(() => {
    if (popup) {
      const listener = (e: DocumentEventMap["keyup"]) => {
        if (e.code === "Escape") closePopup();
      };
      document.addEventListener("keyup", listener, false);
      return () => document.removeEventListener("keyup", listener, false);
    }
  }, [popup, closePopup]);

  return (
    <PopupContext.Provider
      value={{
        popup,
        setPopup,
        closePopup,
      }}
    >
      {children}
    </PopupContext.Provider>
  );
};

export default PopupContext;
