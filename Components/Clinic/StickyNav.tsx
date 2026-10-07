import classes from "./StickyNav.module.css";
import { useEffect, useMemo, useState } from "react";
import { ContentKey } from "../Enums/contentKeys";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import Button from "../UI/Button";
import { WithStyleProps } from "../Layout/Layout";

const NS: ContentNamespace[] = ["common", "medicalCenterNav"];

export type SectionMap = ({ target: string } & (
  | { title: ContentKey; absTitle?: never }
  | { absTitle: string; title?: never }
))[];

const StickyNav = ({
  map,
  className = "",
  style,
}: WithStyleProps<{ map: SectionMap }>) => {
  const getContent = useScopedLocale(NS);

  const [inView, setInView] = useState<string[]>([]);

  const sectionKeys = useMemo(() => map.map((el) => el.target), [map]);

  // one observer per section, made once per section list and disconnected
  // on change (they used to be re-created on every render and never freed)
  const sectionsKey = sectionKeys.join("|");
  useEffect(() => {
    const keys = sectionsKey ? sectionsKey.split("|") : [];
    const observed = new Map<string, IntersectionObserver>();
    const watch = () => {
      for (const section of keys) {
        if (observed.has(section)) continue;
        const node = document.getElementById(section);
        if (!node) continue;
        const observer = new IntersectionObserver((entries) => {
          const [entry] = entries;
          const visible = entry.isIntersecting;
          setInView((prev) => {
            const clone = prev.filter((k) => k !== section);
            if (visible) clone.push(section);
            clone.sort((a, b) => keys.indexOf(a) - keys.indexOf(b));
            return clone;
          });
        });
        observer.observe(node);
        observed.set(section, observer);
      }
    };
    watch();
    // a section that loads after the page (the map card) is picked up later
    const retry = window.setTimeout(watch, 1500);
    return () => {
      window.clearTimeout(retry);
      observed.forEach((o) => o.disconnect());
    };
  }, [sectionsKey]);

  return (
    <div className={`${classes.nav} ${className}`} style={style}>
      {map.map((section) => (
        <Button
          key={section.target}
          variant={inView[0] === section.target ? "Primary" : "Neutral"}
          mode="Fill"
          size="S"
          radius="High"
          onClick={() => {
            const node = document.getElementById(section.target);
            if (!node) return;
            node.scrollIntoView({ behavior: "smooth" });
          }}
        >
          {section.title ? getContent(section.title) : section.absTitle}
        </Button>
      ))}
    </div>
  );
};

export default StickyNav;
