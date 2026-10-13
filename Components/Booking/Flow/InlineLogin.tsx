"use client";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import Link from "@/Components/i18n/Link";
import AuthFlow from "@/Components/Auth/AuthFlow";
import classes from "./InlineLogin.module.css";

const NS: ContentNamespace[] = ["common", "bookingFlow"];

// Sign in without leaving the booking (Zocdoc / Doctolib: the slot is
// held on screen while the patient confirms their phone). The same flow as
// the header's sign-in dialog (Components/Auth/AuthFlow): the mobile number,
// a sign-up step for a number with no account, then the SMS code.
const InlineLogin = () => {
  const getContent = useScopedLocale(NS);

  return (
    <div className={classes.box}>
      <div className={classes.form}>
        <AuthFlow
          compact
          phoneLead={getContent("bfLoginLead")}
          sendLabel={getContent("bfSendCode")}
          verifyLabel={getContent("bfVerifyAndContinue")}
        />
      </div>
      <p className={classes.notice}>
        {getContent("authPolicyNoticePrefix")}{" "}
        <Link href="/policy">{getContent("authPolicyNoticeLink")}</Link>
        {getContent("authPolicyNoticeSuffix")}
      </p>
    </div>
  );
};

export default InlineLogin;
