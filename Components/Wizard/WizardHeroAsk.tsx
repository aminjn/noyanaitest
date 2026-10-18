"use client";
import { FormEvent, useState } from "react";
import useUser from "../Hooks/useUser";
import usePopup from "../Hooks/usePopup";
import AuthPopup from "../Popups/AuthPopup";
import Ixon from "../UI/Ixon";
import SendIcon from "../Icons/SendIcon";
import { tmdRegular, tsmDemiBold, txsMedium } from "../UI/Typography";
import classes from "./WizardLanding.module.css";

// the event WizardPage listens to: the question typed on the landing,
// waiting in its composer once the visitor has signed in
export const WIZARD_ASK_EVENT = "noyan:wizard-ask";

// The landing's question box: the visitor types first and signs in only
// to send (Ada's "start symptom assessment" before the account step).
const WizardHeroAsk = ({
  placeholder,
  start,
  examplesLabel,
  examples,
}: {
  placeholder: string;
  start: string;
  examplesLabel: string;
  examples: string[];
}) => {
  const [text, setText] = useState("");
  const { user } = useUser();
  const { setPopup } = usePopup();

  const ask = (value: string) => {
    const q = value.trim().slice(0, 500);
    if (!q) return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("q", q);
      window.history.replaceState(window.history.state, "", url.toString());
    } catch {
      // the URL keeps no copy
    }
    window.dispatchEvent(new CustomEvent(WIZARD_ASK_EVENT, { detail: q }));
    if (!user) setPopup("Auth", <AuthPopup />);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(text);
  };

  return (
    <div className={classes.ask}>
      <form className={classes.askForm} onSubmit={onSubmit}>
        <textarea
          className={`${classes.askInput} ${tmdRegular}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              ask(text);
            }
          }}
          placeholder={placeholder}
          aria-label={placeholder}
          rows={2}
          maxLength={500}
        />
        <button type="submit" className={`${classes.askSend} ${tsmDemiBold}`} disabled={!text.trim()}>
          <span>{start}</span>
          <Ixon width="1.1rem">
            <SendIcon />
          </Ixon>
        </button>
      </form>
      <div className={classes.examples}>
        <span className={`${classes.examplesLabel} ${txsMedium}`}>{examplesLabel}</span>
        {examples.map((ex) => (
          <button key={ex} type="button" className={`${classes.example} ${txsMedium}`} onClick={() => setText(ex)}>
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WizardHeroAsk;
