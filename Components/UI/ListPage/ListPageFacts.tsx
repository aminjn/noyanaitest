import classes from "./ListPageFacts.module.css";
import { tmdDemiBold, tsmMedium, tsmRegular } from "../Typography";
import Ixon from "../Ixon";
import AlertTriangleIcon from "@/Components/Icons/AlertTriangleIcon";

export type ListPageFact = { title: string; value?: string | null };

// The structured part of an encyclopedia page (2026-10, the owner's
// decision): each filled field of the record - a drug's warnings and
// dosage, a disease's complications and prognosis - as its own titled
// section, the way Drugs.com, Medscape and Halodoc lay out a monograph.
// Empty fields are left out; a group with nothing filled is not drawn.
const ListPageFacts = ({
  title,
  items,
  tone = "default",
  note,
}: {
  title?: string;
  items: ListPageFact[];
  // "warning": safety information (pregnancy, overdose, warning signs) -
  // drawn as a highlighted block with a warning sign, as Drugs.com and
  // Mayo Clinic set their warnings apart
  tone?: "default" | "warning";
  // a fixed line under the items (e.g. "call 115 in an emergency"); the
  // block is drawn for it even when no field is filled
  note?: string;
}) => {
  const filled = (Array.isArray(items) ? items : []).filter(
    (el) => typeof el?.value === "string" && el.value.trim(),
  );
  if (!filled.length && !note) return null;
  return (
    <section
      className={`${classes.main} ${tone === "warning" ? classes.warning : ""}`}
    >
      {!!title && (
        <h2 className={`${classes.title} ${tmdDemiBold}`}>
          {tone === "warning" && (
            <Ixon width="1.25rem" className={classes.icon}>
              <AlertTriangleIcon />
            </Ixon>
          )}
          {title}
        </h2>
      )}
      {!!filled.length && (
        <dl className={classes.list}>
          {filled.map((el) => (
            <div key={el.title} className={classes.item}>
              <dt className={`${classes.term} ${tsmMedium}`}>{el.title}</dt>
              <dd className={`${classes.value} ${tsmRegular}`}>{el.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {!!note && <p className={`${classes.note} ${tsmMedium}`}>{note}</p>}
    </section>
  );
};

export default ListPageFacts;
