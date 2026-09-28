import { MouseEventHandler } from "react";
import classes from "./ConfirmationPopup.module.css";
import usePopup from "@/Components/Hooks/usePopup";
import Button from "@/Components/UI/Button";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common"];

const ConfirmationPopup = ({
  onConfirm,
  message,
  isLoading,
}: {
  message: string;
  onConfirm: MouseEventHandler<HTMLButtonElement>;
  isLoading?: boolean;
}) => {
  const { closePopup } = usePopup();
  // shared by the admin and every panel, so the buttons are translated
  const getContent = useScopedLocale(LOCALE_NS);
  return (
    <div className={classes.main}>
      <p className={classes.message}>{message}</p>
      <div className={classes.actions}>
        <Button onClick={onConfirm} variant="Primary" isLoading={isLoading}>
          {getContent("confirm")}
        </Button>
        <Button onClick={() => closePopup()} variant="Neutral">
          {getContent("cancel")}
        </Button>
      </div>
    </div>
  );
};

export default ConfirmationPopup;
