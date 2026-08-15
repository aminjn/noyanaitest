import { InsurancePageNode } from "./InsurancePage";
import classes from "./InsuranceAdvantages.module.css";
import IconTitle from "../UI/IconTitle";
import useLocale from "../Hooks/useLocale";
import StarDotPlusIcon from "../Icons/StartDotPlusIcon";
import Ixon from "../UI/Ixon";
import { tsmRegular } from "../UI/Typography";

const InsuranceAdvantages = ({ node }: { node: InsurancePageNode }) => {
  const getContent = useLocale();

  if (!node.advantages.length) return null;
  return (
    <div className={classes.main}>
      <IconTitle icon={<StarDotPlusIcon />}>
        {getContent("specialAdvantages")}
      </IconTitle>
      <div className={classes.list}>
        {node.advantages.map((el, i) => (
          <div className={classes.item} key={i}>
            <Ixon className={classes.itemIcon} width="1rem">
              <StarDotPlusIcon />
            </Ixon>
            <span className={`${classes.itemValue} ${tsmRegular}`}>{el}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsuranceAdvantages;
