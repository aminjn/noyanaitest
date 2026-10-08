"use client";
import { useContext, useState } from "react";
import { API } from "@/Components/config";
import useForm from "@/Components/Hooks/useForm";
import useUser from "@/Components/Hooks/useUser";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import SocketContext from "@/Components/Store/SocketContext";
import { isMobile, isOTP } from "@/Components/helpers/Validators";
import Form from "@/Components/UI/Form";
import MobileInput from "@/Components/UI/MobileInput";
import CodeInput from "@/Components/UI/CodeInput";
import Button from "@/Components/UI/Button";
import Link from "@/Components/i18n/Link";
import OtpResend, { otpWait, OtpSendReply } from "@/Components/UI/OtpResend";
import classes from "./InlineLogin.module.css";

const NS: ContentNamespace[] = ["common", "bookingFlow"];

// Sign in without leaving the booking (Zocdoc / Doctolib: the slot is
// held on screen while the patient confirms their phone): the mobile
// number, then the SMS code - the same POST / PATCH /auth as the login
// popup. A new number makes an account on the way.
const InlineLogin = () => {
  const getContent = useScopedLocale(NS);
  const { refreshUser } = useUser(undefined);
  const { reconnect } = useContext(SocketContext);
  const [phone, setPhone] = useState("");
  const [stage, setStage] = useState<"phone" | "code">("phone");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState({ wait: 60, at: 0, recent: false });

  const send = useForm<object, OtpSendReply>({
    path: `${API}/auth`,
    method: "POST",
    parser: "JSON",
    mutator: () => ({ phone: `0${phone}` }),
    successCb: (reply) => {
      setSent({ wait: otpWait(reply), at: Date.now(), recent: reply?.data?.sent === false });
      setStage("code");
    },
  });
  const verify = useForm({
    path: `${API}/auth`,
    method: "PATCH",
    parser: "JSON",
    mutator: () => ({ code, phone: `0${phone}` }),
    successCb: () => {
      refreshUser();
      reconnect();
    },
  });

  return (
    <div className={classes.box}>
      {stage === "phone" ? (
        <Form
          className={classes.form}
          onSubmit={() => {
            if (!send.isLoading && isMobile(phone)) send.submit();
          }}
        >
          <p className={classes.lead}>{getContent("bfLoginLead")}</p>
          <MobileInput onChange={(e) => setPhone(e.target.value)} readOnly={send.isLoading} defaultValue={phone} />
          <Button
            type="submit"
            size="L"
            radius="High"
            variant={isMobile(phone) ? "Primary" : "Disable"}
            isLoading={send.isLoading}
          >
            {getContent("bfSendCode")}
          </Button>
        </Form>
      ) : (
        <Form
          className={classes.form}
          onSubmit={() => {
            if (!verify.isLoading && isOTP(code)) verify.submit();
          }}
        >
          <p className={classes.lead}>{getContent("enterCodeSentToX", [`0${phone}`])}</p>
          <CodeInput autoFocus onChange={(v) => setCode(v)} />
          <div className={classes.row}>
            <button type="button" className={classes.link} onClick={() => setStage("phone")}>
              {getContent("editMobileNumber")}
            </button>
          </div>
          <OtpResend
            wait={sent.wait}
            startedAt={sent.at}
            recent={sent.recent}
            isLoading={send.isLoading}
            onResend={() => send.submit()}
          />
          <Button
            type="submit"
            size="L"
            radius="High"
            variant={isOTP(code) ? "Primary" : "Disable"}
            isLoading={verify.isLoading}
          >
            {getContent("bfVerifyAndContinue")}
          </Button>
        </Form>
      )}
      <p className={classes.notice}>
        {getContent("authPolicyNoticePrefix")}{" "}
        <Link href="/policy">{getContent("authPolicyNoticeLink")}</Link>
        {getContent("authPolicyNoticeSuffix")}
      </p>
    </div>
  );
};

export default InlineLogin;
