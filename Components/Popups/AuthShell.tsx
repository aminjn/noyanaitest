import { ReactNode } from "react";
import classes from "./AuthShell.module.css";
import Link from "next/link";
import LogoLong from "../UI/LogoLong";

const AuthShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className={classes.main}>
      <div className={classes.logo}>
        <LogoLong width={174} height={64} />
      </div>
      {children}
      <p className={classes.notice}>
        با ورود و ثبت نام در سایت،با{" "}
        <Link className={classes.inlineLink} href={"/policy"}>
          قوانین نویان
        </Link>{" "}
        موافقت می‌کنم
      </p>
    </div>
  );
};

export default AuthShell;
