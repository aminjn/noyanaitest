import { useEffect } from "react";
import useLocale from "../Hooks/useLocale";
import usePopup from "../Hooks/usePopup";
import PopupCard from "../UI/PopupCard";

const SelectClinicFirstPopup = () => {
  const getContent = useLocale();
  const { closePopup } = usePopup();

  useEffect(() => {
    const timer = setTimeout(() => closePopup(), 5000);
    return () => {
      clearTimeout(timer);
    };
  });

  return (
    <PopupCard>
      <p>{getContent("selectClinicFirstMessage")}</p>
    </PopupCard>
  );
};

export default SelectClinicFirstPopup;
