import classes from "./ListPageHeaderToggle.module.css";
import ToggleInput from "../ToggleInput";
import { txsMedium } from "../Typography";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common"];
const ListPageHeaderToggle = ({
  count,
  active,
  onChange,
  label,
}: {
  count: number;
  active: boolean;
  onChange: () => unknown;
  // what the switch narrows to (default: packages only, the service list)
  label?: string;
}) => {
  const getContent = useScopedLocale(LOCALE_NS);

  return (
    <div className={classes.listHeader}>
      <span>{`${getContent("results")} (${count})`}</span>
      <div className={classes.toggle}>
        <ToggleInput value={active} onChange={onChange} />
        <span className={txsMedium}>{label ?? getContent("showPackagesOnly")}</span>
      </div>
    </div>
  );
};

export default ListPageHeaderToggle;
