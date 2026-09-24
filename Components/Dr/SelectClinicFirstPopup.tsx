import { useEffect } from "react";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import usePopup from "../Hooks/usePopup";
import PopupCard from "../UI/PopupCard";

const NS: ContentNamespace[] = ["common", "drSelectClinicFirstPopup"];

const SelectClinicFirstPopup = () => {
  const getContent = useScopedLocale(NS);
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
