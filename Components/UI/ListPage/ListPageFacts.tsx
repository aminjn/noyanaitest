import classes from "./ListPageFacts.module.css";
import { tmdDemiBold, tsmMedium, tsmRegular } from "../Typography";

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
}: {
  title?: string;
  items: ListPageFact[];
  // "warning": safety information (pregnancy, overdose...)
  tone?: "default" | "warning";
}) => {
  const filled = items.filter(
    (el) => typeof el.value === "string" && el.value.trim(),
  );
  if (!filled.length) return null;
  return (
    <section
      className={`${classes.main} ${tone === "warning" ? classes.warning : ""}`}
    >
      {!!title && <h2 className={`${classes.title} ${tmdDemiBold}`}>{title}</h2>}
      <dl className={classes.list}>
        {filled.map((el) => (
          <div key={el.title} className={classes.item}>
            <dt className={`${classes.term} ${tsmMedium}`}>{el.title}</dt>
            <dd className={`${classes.value} ${tsmRegular}`}>{el.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

export default ListPageFacts;
