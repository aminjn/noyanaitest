"use client";
import { useIntlLocale } from "@/Components/i18n/navigation";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import Ixon from "@/Components/UI/Ixon";
import CheckIcon from "@/Components/Icons/CheckIcon";
import classes from "./BookingSteps.module.css";

const NS: ContentNamespace[] = ["common", "bookingFlow"];

const steps: ContentKey[] = ["bfStepChoose", "bfStepDetails", "bfStepConfirm"];

// The three steps of booking (choose -> details -> confirm), Doctolib /
// Zocdoc style: where you are and how much is left.
const BookingSteps = ({ current }: { current: 0 | 1 | 2 | 3 }) => {
  const getContent = useScopedLocale(NS);
  const nf = new Intl.NumberFormat(useIntlLocale());
  return (
    <ol className={classes.steps} aria-label={getContent("bfProgress")}>
      {steps.map((key, i) => {
        const state = i < current ? "done" : i === current ? "now" : "next";
        return (
          <li key={key} className={`${classes.step} ${classes[state]}`} aria-current={state === "now" ? "step" : undefined}>
            <span className={classes.dot}>
              {state === "done" ? (
                <Ixon width="0.8rem">
                  <CheckIcon />
                </Ixon>
              ) : (
                nf.format(i + 1)
              )}
            </span>
            <span className={classes.label}>{getContent(key)}</span>
          </li>
        );
      })}
    </ol>
  );
};

export default BookingSteps;
