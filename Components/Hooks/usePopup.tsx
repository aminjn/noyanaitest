import { useContext } from "react";
import PopupContext from "../Store/PopupContext";

const usePopup = () => {
  const { closePopup, setPopup, closeTopPopup } = useContext(PopupContext);
  return { closePopup, setPopup, closeTopPopup };
};

export default usePopup;
