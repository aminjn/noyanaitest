import useLocale from "@/Components/Hooks/useLocale";
import classes from "./ListPageHeaderToggle.module.css";
import ToggleInput from "../ToggleInput";
import { txsMedium } from "../Typography";
const ListPageHeaderToggle = ({
  count,
  active,
  onChange,
}: {
  count: number;
  active: boolean;
  onChange: () => unknown;
}) => {
  const getContent = useLocale();

  return (
    <div className={classes.listHeader}>
      <span>{`${getContent("results")} (${count})`}</span>
      <div className={classes.toggle}>
        <ToggleInput value={active} onChange={onChange} />
        <span className={txsMedium}>{getContent("showPackagesOnly")}</span>
      </div>
    </div>
  );
};

export default ListPageHeaderToggle;
