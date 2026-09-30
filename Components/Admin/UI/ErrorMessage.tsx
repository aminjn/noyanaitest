import classes from "./ErrorMessage.module.css";
import { ta } from "@/Components/Admin/i18n/adminText";

const ErrorMessage = ({
  message = ta("خطای ناشناخته ای رخ داده"),
}: {
  message?: string;
}) => {
  return <p className={classes.main}>{message}</p>;
};

export default ErrorMessage;
