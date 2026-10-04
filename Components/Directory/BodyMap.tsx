"use client";
import Link from "@/Components/i18n/Link";
import { useLocalizePath } from "@/Components/i18n/navigation";
import { txsMedium } from "../UI/Typography";
import { DirectoryFacetRow, directoryFacetPath } from "./directoryTypes";
import classes from "./BodyMap.module.css";

// The symptom directory's body map (WebMD Symptom Checker / Altibbi body
// picker, simplified): a front-view figure whose regions link to the body
// part filed under that region (Part.region, set in the admin). Parts with
// no drawable region (back, skin, whole body) are the chips beside it.
type Shape = { region: string; d: string };
const SHAPES: Shape[] = [
  { region: "head", d: "M100 12a32 34 0 1 1 0 68a32 34 0 1 1 0-68z" },
  { region: "neck", d: "M88 80h24v18H88z" },
  { region: "chest", d: "M62 98h76q8 0 8 10v58H54v-58q0-10 8-10z" },
  { region: "abdomen", d: "M56 166h88v54H56z" },
  { region: "pelvis", d: "M56 220h88l-10 34H66z" },
  { region: "arms", d: "M34 104q6-8 18-4l-2 70-8 70H26l2-70z" },
  { region: "arms", d: "M166 104q-6-8-18-4l2 70 8 70h16l-2-70z" },
  { region: "legs", d: "M66 254h32l-4 150H72z" },
  { region: "legs", d: "M102 254h32l-6 150h-22z" },
];

const BodyMap = ({
  parts,
  active,
  title,
}: {
  parts: DirectoryFacetRow[];
  active?: string;
  title: string;
}) => {
  const localize = useLocalizePath();
  const byRegion = new Map<string, DirectoryFacetRow>();
  for (const part of parts)
    if (part.region && !byRegion.has(part.region)) byRegion.set(part.region, part);
  const slugOf = (p: DirectoryFacetRow) => p.slug || p._id;

  return (
    <section className={classes.main}>
      <h2 className={`${classes.title} ${txsMedium}`}>{title}</h2>
      <div className={classes.body}>
        <svg viewBox="0 0 200 410" className={classes.svg} role="img" aria-label={title}>
          {SHAPES.map((shape, i) => {
            const part = byRegion.get(shape.region);
            if (!part) return <path key={i} d={shape.d} className={classes.off} />;
            const on = active === slugOf(part);
            return (
              <a key={i} href={localize(directoryFacetPath("symptom", "part", slugOf(part)))} aria-label={part.name}>
                <title>{part.name}</title>
                <path d={shape.d} className={`${classes.region} ${on ? classes.on : ""}`} />
              </a>
            );
          })}
        </svg>
        <ul className={classes.list}>
          {parts.map((part) => (
            <li key={part._id}>
              <Link
                href={directoryFacetPath("symptom", "part", slugOf(part))}
                className={`${classes.chip} ${active === slugOf(part) ? classes.chipOn : ""} ${txsMedium}`}
                aria-current={active === slugOf(part) ? "page" : undefined}
              >
                {part.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default BodyMap;
