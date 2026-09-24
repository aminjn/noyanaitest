import { Dispatch, SetStateAction } from "react";
import Button from "../UI/Button";
import classes from "./FilterCsr.module.css";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common"];
const FilterCsr = ({
  filter,
  setFilter,
  options,
}: {
  filter: string | null;
  setFilter: Dispatch<SetStateAction<string | null>>;
  options: { value: string; title: string }[];
}) => {
  const getContent = useScopedLocale(NS);
  return (
    <div className={classes.nav}>
      <Button
        type="button"
        variant={!filter ? "Primary" : "Neutral"}
        radius="High"
        mode="Fill"
        size="S"
        onClick={() => setFilter(null)}
      >
        {getContent("all")}
      </Button>
      {options.map((opt) => (
        <Button
          type="button"
          key={opt.value}
          variant={filter === opt.value ? "Primary" : "Neutral"}
          mode="Fill"
          size="S"
          radius="High"
          onClick={() => setFilter(opt.value)}
        >
          {opt.title}
        </Button>
      ))}
    </div>
  );
};

export default FilterCsr;
