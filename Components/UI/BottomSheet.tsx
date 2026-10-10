"use client";
import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Ixon from "./Ixon";
import XMarkIcon from "../Icons/XMarkIcon";
import { closeInstallSheet } from "../Pwa/usePwaInstall";
import classes from "./BottomSheet.module.css";

// A phone-first sheet (2026-10, the booking flow): slides up from the
// bottom on a phone, a centred dialog from 768px on. A sticky footer holds
// the sheet's main action so it stays under the thumb. Escape, the backdrop
// and the close button dismiss it; the page behind does not scroll.
const BottomSheet = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  closeLabel,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  closeLabel: string;
}) => {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    // the "install the app" card must not sit over the sheet
    closeInstallSheet();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
  if (!mounted || !open) return null;
  return createPortal(
    <div className={classes.root}>
      <div className={classes.backdrop} onClick={onClose} />
      <div className={classes.panel} role="dialog" aria-modal="true" tabIndex={-1} ref={panelRef}>
        <span className={classes.grip} aria-hidden="true" />
        <header className={classes.head}>
          <div className={classes.titles}>
            <h2 className={classes.title}>{title}</h2>
            {!!subtitle && <p className={classes.subtitle}>{subtitle}</p>}
          </div>
          <button type="button" className={classes.close} onClick={onClose} aria-label={closeLabel}>
            <Ixon width="1rem">
              <XMarkIcon />
            </Ixon>
          </button>
        </header>
        <div className={classes.body}>{children}</div>
        {!!footer && <footer className={classes.foot}>{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
};

export default BottomSheet;
