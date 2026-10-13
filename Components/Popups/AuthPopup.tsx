"use client";
import { KeyboardEvent, useCallback, useEffect, useId, useRef } from "react";
import classes from "./AuthPopup.module.css";
import useUser from "../Hooks/useUser";
import usePopup from "../Hooks/usePopup";
import useScopedLocale from "../Hooks/useScopedLocale";
import AuthFlow from "../Auth/AuthFlow";
import LogoLong from "../UI/LogoLong";
import Ixon from "../UI/Ixon";
import XMarkIcon from "../Icons/XMarkIcon";
import ShieldCheckIcon from "../Icons/ShieldCheckIcon";
import Link from "@/Components/i18n/Link";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), [tabindex]:not([tabindex="-1"])';

// The «ورود / ثبت‌نام» dialog: a centred card on wide screens, a bottom sheet
// on phones (Popup.module.css places a [data-sheet] child at the bottom).
// One flow for logging in and signing up: a new number reaches the sign-up
// step on its own (Components/Auth/AuthFlow).
const AuthPopup = () => {
  const { user } = useUser(undefined);
  const { closeTopPopup } = usePopup();
  const getContent = useScopedLocale();
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);

  // closes itself once: signed in (code accepted, or in another tab) or the X
  const closed = useRef(false);
  const close = useCallback(() => {
    if (closed.current) return;
    closed.current = true;
    closeTopPopup();
  }, [closeTopPopup]);

  useEffect(() => {
    if (!!user) close();
  }, [close, user]);

  // focus goes back to what opened the dialog
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    return () => opener?.focus?.();
  }, []);

  // Tab stays inside the dialog
  const trapTab = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !ref.current) return;
    const items = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      ref={ref}
      className={classes.sheet}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-sheet
      onKeyDown={trapTab}
    >
      <span className={classes.grabber} aria-hidden />
      <div className={classes.top}>
        <LogoLong width={112} height={40} />
        <button type="button" className={classes.close} onClick={close} aria-label={getContent("close")}>
          <Ixon width="1.125rem">
            <XMarkIcon />
          </Ixon>
        </button>
      </div>
      <AuthFlow titleId={titleId} onDone={close} />
      <div className={classes.foot}>
        <p className={classes.trust}>
          <Ixon width="1rem">
            <ShieldCheckIcon />
          </Ixon>
          <span>{getContent("authTrustLine")}</span>
        </p>
        <p className={classes.terms}>
          {getContent("authPolicyNoticePrefix")}{" "}
          <Link className={classes.termsLink} href="/policy" onClick={close}>
            {getContent("authPolicyNoticeLink")}
          </Link>
          {getContent("authPolicyNoticeSuffix")}
        </p>
      </div>
    </div>
  );
};

export default AuthPopup;
