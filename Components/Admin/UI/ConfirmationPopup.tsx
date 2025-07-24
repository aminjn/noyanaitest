import { MouseEventHandler } from "react";
import classes from "./ConfirmationPopup.module.css";
import usePopup from "@/Components/Hooks/usePopup";
import Button from "@/Components/UI/Button";

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
  return (
    <div className={classes.main}>
      <p className={classes.message}>{message}</p>
      <div className={classes.actions}>
        <Button onClick={onConfirm} variant="Primary" isLoading={isLoading}>
          تایید
        </Button>
        <Button onClick={() => closePopup()} variant="Neutral">
          انصراف
        </Button>
      </div>
    </div>
  );
};

export default ConfirmationPopup;
