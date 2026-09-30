"use client";
import { ReactNode } from "react";
import { AdminEmbeddedProvider } from "../UI/AdminEmbedded";
import classes from "./CentreSections.module.css";

// One tab of a centre's record page made of several parts (panel owner,
// doctors, departments...): each part is a titled section, stacked. The
// parts' own WithTitle headers render embedded (no back button, a small
// heading), so the tab reads as one page.
export const CentreSections = ({ children }: { children: ReactNode }) => (
  <AdminEmbeddedProvider value={true}>
    <div className={classes.sections}>{children}</div>
  </AdminEmbeddedProvider>
);

// A section that has no WithTitle of its own: a heading and a one-line
// explanation of what it controls.
export const CentreSection = ({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) => (
  <section className={classes.section}>
    <div className={classes.head}>
      <h2 className={classes.title}>{title}</h2>
      {!!hint && <p className={classes.hint}>{hint}</p>}
    </div>
    {children}
  </section>
);
