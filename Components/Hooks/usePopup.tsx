import { useContext } from "react";
import PopupContext from "../Store/PopupContext";

const usePopup = () => {
  const { closePopup, setPopup } = useContext(PopupContext);
  return { closePopup, setPopup };
};

export default usePopup;
