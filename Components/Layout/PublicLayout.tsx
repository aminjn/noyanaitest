import { ReactNode } from "react";
import classes from "./PublicLayout.module.css";
import PublicHeader from "./PublicHeader";

const PublicLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className={classes.main}>
      <PublicHeader />
      {children}
    </main>
  );
};

export default PublicLayout;
