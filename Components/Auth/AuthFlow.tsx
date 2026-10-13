"use client";
import { FormEvent, useContext, useEffect, useId, useRef, useState } from "react";
import classes from "./AuthFlow.module.css";
import fieldClasses from "../UI/MobileInput.module.css";
import { API } from "../config";
import { fetcher, FetchError } from "../helpers/fetcher";
import { isMobile, isOTP } from "../helpers/Validators";
import { formatMobile, ltrIsolate, toLatinDigits } from "../helpers/phone";
import useUser from "../Hooks/useUser";
import useScopedLocale from "../Hooks/useScopedLocale";
import SocketContext from "../Store/SocketContext";
import MobileInput from "../UI/MobileInput";
import CodeInput from "../UI/CodeInput";
import DateInput from "../UI/DateInput";
import Button from "../UI/Button";
import OtpResend, { otpWait, OtpSendReply } from "../UI/OtpResend";
import Ixon from "../UI/Ixon";
import AlertCircleIcon from "../Icons/AlertCircleIcon";
import EditLineIcon from "../Icons/EditLineIcon";
import { ContentKey } from "../Enums/contentKeys";

export type AuthStep = "phone" | "details" | "otp";

const OTP_LENGTH = 6;

// Fallback when the server gives no machine code (an older backend): its
// Persian message for "no account with this number".
const NOT_REGISTERED_FA = "شما قبلا ثبت نام نکردید";

const isNotRegistered = (err: unknown) =>
  err instanceof FetchError && (err.code === "NOT_REGISTERED" || err.message === NOT_REGISTERED_FA);

const messageOf = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback;

// One sign-in flow for everyone (Doctolib / Snapp / Digikala): the mobile
// number first; a number with an account gets the SMS code straight away,
// a new number is asked for what the sign-up needs (national ID + date of
// birth, checked against the identity registry) and then gets the code.
// Same calls as before: POST /auth, POST /auth/signup, PATCH /auth.
const AuthFlow = ({
  titleId,
  onStepChange,
  onDone,
  compact,
  phoneLead,
  sendLabel,
  verifyLabel,
}: {
  // the step heading's id, for the dialog's aria-labelledby
  titleId?: string;
  onStepChange?: (step: AuthStep) => unknown;
  onDone?: () => unknown;
  // inside a page (booking): smaller headings
  compact?: boolean;
  phoneLead?: string;
  sendLabel?: string;
  verifyLabel?: string;
}) => {
  const getContent = useScopedLocale();
  const { refreshUser } = useUser(undefined);
  const { reconnect } = useContext(SocketContext);
  const ownId = useId();
  const headingId = titleId || ownId;

  const [step, setStep] = useState<AuthStep>("phone");
  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [nationalId, setNationalId] = useState("");
  const [birthDate, setBirthDate] = useState<Date | undefined>();
  const [detailsTried, setDetailsTried] = useState(false);
  const [code, setCode] = useState("");
  const [codeRefused, setCodeRefused] = useState(false);
  // how the code was asked for: a resend repeats the same call
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [sent, setSent] = useState({ wait: 60, at: 0, recent: false });
  const [busy, setBusy] = useState<null | "send" | "signup" | "verify" | "resend">(null);
  const [error, setError] = useState("");

  const nationalRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const stepRef = useRef<HTMLDivElement>(null);

  // focus follows the step; inside a page (compact) not on first paint,
  // so the booking page does not jump to the sign-in box
  const firstPaint = useRef(true);
  useEffect(() => {
    onStepChange?.(step);
    setError("");
    const skip = compact && firstPaint.current;
    firstPaint.current = false;
    if (skip) return;
    if (step === "phone") phoneRef.current?.focus();
    if (step === "details") nationalRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const phoneValid = isMobile(phone);
  const phoneError =
    (phoneTouched || phone.length >= 10) && phone && !phoneValid ? getContent("mobileNumberFormatError") : "";
  const nationalValid = /^\d{10}$/.test(nationalId);

  const afterSend = (reply: OtpSendReply | undefined) => {
    setSent({ wait: otpWait(reply), at: Date.now(), recent: reply?.data?.sent === false });
    setCode("");
    setCodeRefused(false);
    setStep("otp");
  };

  const sendLogin = async (asResend?: boolean) => {
    if (busy) return;
    setBusy(asResend ? "resend" : "send");
    setError("");
    try {
      const reply = await fetcher<OtpSendReply>({
        url: `${API}/auth`,
        method: "POST",
        payload: { phone: `0${phone}` },
      });
      setMode("login");
      afterSend(reply);
    } catch (err) {
      if (isNotRegistered(err)) {
        setMode("signup");
        setStep("details");
      } else setError(messageOf(err, getContent("checkInput")));
    } finally {
      setBusy(null);
    }
  };

  const sendSignup = async (asResend?: boolean) => {
    if (busy) return;
    setBusy(asResend ? "resend" : "signup");
    setError("");
    try {
      const reply = await fetcher<OtpSendReply>({
        url: `${API}/auth/signup`,
        method: "POST",
        bodyParser: "FORM",
        payload: { phone: `0${phone}`, nationalId, birthDate },
      });
      setMode("signup");
      afterSend(reply);
    } catch (err) {
      setError(messageOf(err, getContent("checkInput")));
    } finally {
      setBusy(null);
    }
  };

  const verify = async (value: string) => {
    if (busy || !isOTP(value)) return;
    setBusy("verify");
    setError("");
    try {
      await fetcher({ url: `${API}/auth`, method: "PATCH", payload: { code: value, phone: `0${phone}` } });
      refreshUser();
      reconnect();
      onDone?.();
    } catch (err) {
      setError(messageOf(err, getContent("checkInput")));
      setCodeRefused(true);
      setCode("");
    } finally {
      setBusy(null);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (step === "phone") {
      setPhoneTouched(true);
      if (phoneValid) sendLogin();
    } else if (step === "details") {
      setDetailsTried(true);
      if (nationalValid && birthDate) sendSignup();
      else if (!nationalValid) nationalRef.current?.focus();
    } else verify(code);
  };

  const editNumber = () => {
    setStep("phone");
    setCode("");
    setCodeRefused(false);
  };

  const heading: Record<AuthStep, ContentKey> = {
    phone: "authTitle",
    details: "authSignupTitle",
    otp: "authOtpTitle",
  };

  const editLink = (
    <button type="button" className={classes.linkButton} onClick={editNumber}>
      <Ixon width="0.95rem">
        <EditLineIcon />
      </Ixon>
      {getContent("editMobileNumber")}
    </button>
  );

  const numberChip = (
    <div className={classes.numberChip}>
      <bdi dir="ltr" className={classes.numberText}>
        {formatMobile(phone)}
      </bdi>
      {editLink}
    </div>
  );

  return (
    <form className={`${classes.main} ${compact ? classes.compact : ""}`} onSubmit={submit} noValidate>
      <div key={step} ref={stepRef} className={classes.step}>
        <div className={classes.heading}>
          {/* in a page the box already sits under a «sign in» heading */}
          <h2 id={headingId} className={`${classes.title} ${compact && step === "phone" ? classes.visuallyHidden : ""}`}>
            {getContent(heading[step])}
          </h2>
          <p className={classes.subtitle}>
            {step === "phone"
              ? phoneLead || getContent("authPhoneSubtitle")
              : step === "details"
                ? getContent("authSignupSubtitle")
                : getContent("enterCodeSentToX", [ltrIsolate(formatMobile(phone))])}
          </p>
          {step === "otp" && editLink}
        </div>

        {step === "phone" && (
          <MobileInput
            inputRef={phoneRef}
            value={phone}
            onChange={(v) => {
              setPhone(v);
              if (error) setError("");
            }}
            onBlur={() => setPhoneTouched(true)}
            readOnly={busy === "send"}
            error={phoneError}
          />
        )}

        {step === "details" && (
          <div className={classes.fields}>
            {numberChip}
            <div className={fieldClasses.main}>
              <label className={fieldClasses.label} htmlFor={`${headingId}-nid`}>
                {getContent("nationalCode")}
              </label>
              <div
                className={`${fieldClasses.control} ${detailsTried && !nationalValid ? fieldClasses.invalid : ""}`}
                dir="ltr"
              >
                <input
                  ref={nationalRef}
                  id={`${headingId}-nid`}
                  className={fieldClasses.input}
                  inputMode="numeric"
                  autoComplete="off"
                  dir="ltr"
                  placeholder="0012345678"
                  maxLength={10}
                  value={nationalId}
                  readOnly={busy === "signup"}
                  aria-invalid={detailsTried && !nationalValid}
                  aria-describedby={detailsTried && !nationalValid ? `${headingId}-nid-error` : undefined}
                  onChange={(e) => setNationalId(toLatinDigits(e.target.value).replace(/\D/g, "").slice(0, 10))}
                />
              </div>
              {detailsTried && !nationalValid && (
                <p id={`${headingId}-nid-error`} className={fieldClasses.error} role="alert">
                  <Ixon width="1rem">
                    <AlertCircleIcon />
                  </Ixon>
                  <span>{getContent("nationalCodeFormatError")}</span>
                </p>
              )}
            </div>
            <div className={`${fieldClasses.main} ${classes.dateField}`}>
              <span className={fieldClasses.label}>{getContent("dateOfBirth")}</span>
              <DateInput
                className={`${classes.date} ${detailsTried && !birthDate ? classes.dateInvalid : ""}`}
                defaultValue={birthDate}
                onChange={(d) => setBirthDate(d)}
                readOnly={busy === "signup"}
              />
              {detailsTried && !birthDate && (
                <p className={fieldClasses.error} role="alert">
                  <Ixon width="1rem">
                    <AlertCircleIcon />
                  </Ixon>
                  <span>{getContent("birthDateRequired")}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {step === "otp" && (
          <div className={classes.fields}>
            <CodeInput
              autoFocus
              length={OTP_LENGTH}
              value={code}
              invalid={codeRefused}
              readOnly={busy === "verify"}
              onChange={(v) => {
                setCode(v);
                if (codeRefused && v) {
                  setCodeRefused(false);
                  setError("");
                }
              }}
              // the last digit sends it (no extra tap, as Snapp / Digikala)
              onComplete={(v) => verify(v)}
            />
            <OtpResend
              wait={sent.wait}
              startedAt={sent.at}
              recent={sent.recent}
              isLoading={busy === "resend"}
              onResend={() => (mode === "signup" ? sendSignup(true) : sendLogin(true))}
            />
          </div>
        )}

        {!!error && (
          <p className={classes.alert} role="alert">
            <Ixon width="1.125rem">
              <AlertCircleIcon />
            </Ixon>
            <span>{error}</span>
          </p>
        )}

        <Button
          type="submit"
          variant="Primary"
          mode="Fill"
          size="L"
          radius="High"
          className={classes.submit}
          isLoading={busy === "send" || busy === "signup" || busy === "verify"}
          disabled={step === "phone" ? phone.length < 10 : step === "otp" ? code.length < OTP_LENGTH : false}
        >
          {step === "otp" ? verifyLabel || getContent("authVerify") : sendLabel || getContent("confirmAndContinue")}
        </Button>
      </div>
    </form>
  );
};

export default AuthFlow;
