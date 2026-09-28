"use client";

import { ReactNode } from "react";
import classes from "./ActionInbox.module.css";

export type InboxAction = {
  label: string;
  onClick: () => unknown;
  kind?: "primary" | "ghost" | "danger";
  disabled?: boolean;
};

export type InboxItem = {
  id: string;
  lead: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  body?: ReactNode;
  actions?: InboxAction[];
};

// A "waiting for you" list: each row is one decision with its buttons right
// there (Stripe / Shopify-style), so nothing needs a trip to another page.
const ActionInbox = ({ items, highlight }: { items: InboxItem[]; highlight?: boolean }) => (
  <ul className={classes.list}>
    {items.map((it) => (
      <li key={it.id} className={`${classes.row} ${highlight ? classes.highlight : ""}`}>
        <span className={classes.lead}>{it.lead}</span>
        <div className={classes.meta}>
          <strong>{it.title}</strong>
          {!!it.subtitle && <span>{it.subtitle}</span>}
          {!!it.body && <p className={classes.body}>{it.body}</p>}
        </div>
        {!!it.actions?.length && (
          <div className={classes.actions}>
            {it.actions.map((a) => (
              <button
                key={a.label}
                type="button"
                className={classes[a.kind || "ghost"]}
                onClick={a.onClick}
                disabled={a.disabled}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </li>
    ))}
  </ul>
);

export default ActionInbox;
