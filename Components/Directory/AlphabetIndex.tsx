"use client";
import Link from "@/Components/i18n/Link";
import { useLocale } from "@/Components/i18n/navigation";
import { txsMedium } from "../UI/Typography";
import { DirectoryKind, directoryAlphabet, directoryFacetPath } from "./directoryTypes";
import classes from "./AlphabetIndex.module.css";

// The A to Z bar of a directory (Mayo Clinic "Diseases & Conditions A-Z",
// Drugs.com "Browse A-Z"): one crawlable link per letter; a letter with no
// entry is shown but not linked, so the bar keeps its shape.
const AlphabetIndex = ({
  kind,
  letters,
  active,
  title,
}: {
  kind: DirectoryKind;
  letters: { letter: string; count: number }[];
  active?: string;
  title: string;
}) => {
  const locale = useLocale();
  const alphabet = directoryAlphabet(locale, letters);
  return (
    <nav className={classes.main} aria-label={title}>
      <span className={`${classes.title} ${txsMedium}`}>{title}</span>
      <ul className={classes.list}>
        {alphabet.map(({ letter, count }) => (
          <li key={letter}>
            {count > 0 ? (
              <Link
                href={directoryFacetPath(kind, "letter", letter)}
                className={`${classes.letter} ${active === letter ? classes.active : ""} ${txsMedium}`}
                aria-current={active === letter ? "page" : undefined}
              >
                {letter}
              </Link>
            ) : (
              <span className={`${classes.letter} ${classes.empty} ${txsMedium}`} aria-disabled="true">
                {letter}
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default AlphabetIndex;
