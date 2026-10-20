import { Fragment, ReactNode } from "react";
import Link from "../i18n/Link";
import classes from "./WizardPage.module.css";

// The health chat's reply as the patient should read it (2026-10): the
// model writes light markdown («## تشخیص», «- ...», **bold**), shown here as
// headings, list items and bold text, and every condition the site has a
// page for becomes a blue link to it (backend Lib/wizardTriage.ts finds
// them). Text only - nothing from the model is ever rendered as HTML. The
// assessment's machine lines ([[specialty: ...]]) never show, not even
// half-streamed.

export type WizardLinkTarget = { name: string; slug?: string };

export const hideMachineLines = (text: string) => text.replace(/\[\[[\s\S]*?(\]\]|$)/g, "").trimEnd();

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// «نمونه‌ی آزمایشی» and «نمونه ی آزمایشی» are the same name: a space and a
// half-space match each other, and Arabic ي / ك their Persian forms
const loose = (s: string) => s.replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/[\s\u200c]+/g, " ").trim();
const namePattern = (name: string) =>
  escape(loose(name))
    .replace(/ /g, "[\\s\u200c]+")
    .replace(/ی/g, "[یي]")
    .replace(/ک/g, "[کك]");

// the line's text with **bold** and the condition links
const inline = (text: string, links: WizardLinkTarget[], keyBase: string): ReactNode[] => {
  const targets = links.filter((l) => l.slug && l.name && l.name.length >= 3).sort((a, b) => b.name.length - a.name.length);
  const pattern = targets.length ? new RegExp(`(${targets.map((t) => namePattern(t.name)).join("|")})`, "g") : null;
  const out: ReactNode[] = [];
  text.split(/(\*\*[^*]+\*\*)/g).forEach((part, i) => {
    const bold = /^\*\*[^*]+\*\*$/.test(part);
    const body = bold ? part.slice(2, -2) : part;
    const pieces = pattern ? body.split(pattern) : [body];
    const nodes = pieces.map((piece, j) => {
      const hit = j % 2 === 1 ? targets.find((t) => loose(t.name) === loose(piece)) : undefined;
      return hit ? (
        <Link key={`${keyBase}-${i}-${j}`} href={`/disease/${hit.slug}`} className={classes.diseaseLink}>
          {piece}
        </Link>
      ) : (
        <Fragment key={`${keyBase}-${i}-${j}`}>{piece}</Fragment>
      );
    });
    out.push(bold ? <strong key={`${keyBase}-b${i}`}>{nodes}</strong> : <Fragment key={`${keyBase}-f${i}`}>{nodes}</Fragment>);
  });
  return out;
};

const WizardMessageText = ({ text, links = [] }: { text: string; links?: WizardLinkTarget[] }) => {
  const lines = hideMachineLines(text).split("\n");
  const blocks: ReactNode[] = [];
  let list: ReactNode[] = [];
  const flush = (key: string) => {
    if (list.length) blocks.push(<ul key={`ul-${key}`} className={classes.msgList}>{list}</ul>);
    list = [];
  };
  lines.forEach((raw, i) => {
    const line = raw.trim();
    const item = line.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (item) {
      list.push(<li key={`li-${i}`}>{inline(item[1], links, `li${i}`)}</li>);
      return;
    }
    flush(String(i));
    if (!line) return;
    const heading = line.match(/^#{1,4}\s*(.*)$/);
    if (heading) {
      blocks.push(
        <p key={`h-${i}`} className={classes.msgHeading}>
          {inline(heading[1], links, `h${i}`)}
        </p>,
      );
      return;
    }
    blocks.push(
      <p key={`p-${i}`} className={classes.msgPara}>
        {inline(line, links, `p${i}`)}
      </p>,
    );
  });
  flush("end");
  return <>{blocks}</>;
};

export default WizardMessageText;
