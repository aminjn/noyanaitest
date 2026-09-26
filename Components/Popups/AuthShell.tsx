import { ReactNode } from "react";
import classes from "./AuthShell.module.css";
import Link from "@/Components/i18n/Link";
import LogoLong from "../UI/LogoLong";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";

const AuthShell = ({ children }: { children: ReactNode }) => {
  const getContent = useScopedLocale();
  return (
    <div className={classes.main}>
      <div className={classes.logo}>
        <LogoLong width={174} height={64} />
      </div>
      {children}
      <p className={classes.notice}>
        {getContent("authPolicyNoticePrefix")}{" "}
        <Link className={classes.inlineLink} href={"/policy"}>
          {getContent("authPolicyNoticeLink")}
        </Link>
        {getContent("authPolicyNoticeSuffix")}
      </p>
    </div>
  );
};

export default AuthShell;
