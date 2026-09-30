import { ReactNode } from "react";
import classes from "./RequestInfoGrid.module.css";

export type RequestInfoItem = {
  label: string;
  value?: ReactNode;
  // spans the whole row (address, description...)
  wide?: boolean;
};

const isEmpty = (v: ReactNode) =>
  v === undefined || v === null || v === false || (typeof v === "string" && !v.trim());

// A read-only label / value grid for a provider request (2026-09): the
// request is the applicant's own statement, the admin only decides on it,
// so it is shown as facts, never as an editable form. A missing value shows
// a dash instead of an empty line.
const RequestInfoGrid = ({
  title,
  items,
}: {
  title?: string;
  items: RequestInfoItem[];
}) => (
  <section className={classes.main}>
    {!!title && <h3 className={classes.title}>{title}</h3>}
    <dl className={classes.grid}>
      {items.map((item, i) => (
        <div
          key={`${item.label}-${i}`}
          className={`${classes.item} ${item.wide ? classes.wide : ""}`}
        >
          <dt className={classes.label}>{item.label}</dt>
          <dd className={classes.value}>
            {isEmpty(item.value) ? "—" : item.value}
          </dd>
        </div>
      ))}
    </dl>
  </section>
);

export default RequestInfoGrid;
