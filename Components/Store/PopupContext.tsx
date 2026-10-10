"use client";
import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

export type SetPopup = (key: string, popup: ReactNode) => void;
type PopupMap = Record<string, ReactNode>;
type ClosePopup = (key?: string) => void;

const PopupContext = createContext<{
  popups: PopupMap;
  setPopup: SetPopup;
  closePopup: ClosePopup;
  // closes only the popup on top (a popup's own X): a nested popup (add an
  // address from the checkout) must not take its parent with it
  closeTopPopup: () => void;
}>({
  closePopup: () => {},
  closeTopPopup: () => {},
  popups: {},
  setPopup: () => {},
});

export const PopupContextProvider = ({ children }: { children: ReactNode }) => {
  const [popups, setPopups] = useState<PopupMap>({});

  const closePopup = useCallback((key?: string) => {
    if (key) {
      setPopups((prev) => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    } else {
      setPopups({});
    }
  }, []);

  const closeTopPopup = useCallback(() => {
    setPopups((prev) => {
      const keys = Object.keys(prev);
      if (!keys.length) return prev;
      const { [keys[keys.length - 1]]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const setPopup = useCallback((key: string, popup: ReactNode) => {
    setPopups((prev) => ({ ...prev, [key]: popup }));
  }, []);

  useEffect(() => {
    if (Object.keys(popups).length) {
      const listener = (e: DocumentEventMap["keyup"]) => {
        if (e.code === "Escape")
          closePopup(
            Object.keys(popups).find((_, i, arr) => i === arr.length - 1)
          );
      };
      document.addEventListener("keyup", listener, false);
      return () => document.removeEventListener("keyup", listener, false);
    }
  }, [closePopup, popups]);

  return (
    <PopupContext.Provider
      value={{
        popups,
        setPopup,
        closePopup,
        closeTopPopup,
      }}
    >
      {children}
    </PopupContext.Provider>
  );
};

export default PopupContext;
