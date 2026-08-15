import classes from "./StickyNav.module.css";
import { useEffect, useMemo, useState } from "react";
import { ContentKey } from "../Enums/contentKeys";
import useLocale from "../Hooks/useLocale";
import Button from "../UI/Button";
import { WithStyleProps } from "../Layout/Layout";

export type SectionMap = ({ target: string } & (
  | { title: ContentKey; absTitle?: never }
  | { absTitle: string; title?: never }
))[];

const StickyNav = ({
  map,
  className = "",
  style,
}: WithStyleProps<{ map: SectionMap }>) => {
  const getContent = useLocale();

  const [inView, setInView] = useState<string[]>([]);

  const sectionKeys = useMemo(() => map.map((el) => el.target), [map]);

  useEffect(() => {
    for (const section of sectionKeys) {
      const node = document.getElementById(section);
      if (!node) continue;
      const observer = new IntersectionObserver((entries) => {
        const [entry] = entries;
        const visible = entry.isIntersecting;
        setInView((prev) => {
          const clone = [...prev];
          const index = prev.indexOf(section);
          if (visible) {
            if (index < 0) {
              clone.push(section);
            }
          } else {
            if (index > -1) clone.splice(index, 1);
          }
          clone.sort((a, b) => sectionKeys.indexOf(a) - sectionKeys.indexOf(b));
          return clone;
        });
      });
      observer.observe(node);
    }
  });

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
