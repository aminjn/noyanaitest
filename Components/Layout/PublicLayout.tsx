import { ReactNode } from "react";
import classes from "./PublicLayout.module.css";
import PublicHeader from "./PublicHeader";
import PublicFooter from "./PublicFooter";

const PublicLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className={classes.main}>
      <PublicHeader />
      {children}
      <PublicFooter />
    </main>
  );
};

export default PublicLayout;
