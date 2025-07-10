import { ReactElement, ReactNode } from "react";
import classes from "./HandleLoading.module.css";
import ErrorMessage from "./ErrorMessage";
import Loading from "./Loading";

const HandleLoading = ({
  children,
  data,
  error,
}: {
  data: boolean;
  error?: { message?: string };
  children?: ReactNode;
}) => {
  if (!data && error) return <ErrorMessage message={error.message} />;
  if (!data) return <Loading />;
  return children;
};

export default HandleLoading;
