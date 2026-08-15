import useLocale from "../Hooks/useLocale";
import CheckIcon from "../Icons/CheckIcon";
import ShieldIcon from "../Icons/ShieldIcon";
import IconTitle from "../UI/IconTitle";
import Ixon from "../UI/Ixon";
import { tsmDemiBold } from "../UI/Typography";
import classes from "./InsuranceCoverages.module.css";
import { InsurancePageNode } from "./InsurancePage";
const InsuranceCoverages = ({ node }: { node: InsurancePageNode }) => {
  const getContent = useLocale();

  if (!node.coverages.length) return null;
  return (
    <div className={classes.main}>
      <IconTitle icon={<ShieldIcon />}>
        {getContent("insuranceCoverages")}
      </IconTitle>
      <div className={classes.list}>
        {node.coverages.map((el, i) => (
          <div key={i} className={classes.item}>
            <div className={classes.itemIcon}>
              <Ixon width="1rem">
                <CheckIcon />
              </Ixon>
            </div>
            <span className={`${classes.itemValue} ${tsmDemiBold}`}>{el}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsuranceCoverages;
