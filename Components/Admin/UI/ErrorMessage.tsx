import classes from "./ErrorMessage.module.css";

const ErrorMessage = ({
  message = "خطای ناشناخته ای رخ داده",
}: {
  message?: string;
}) => {
  return <p className={classes.main}>{message}</p>;
};

export default ErrorMessage;
