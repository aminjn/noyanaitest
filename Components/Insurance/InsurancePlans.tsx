import { IInsurancePlan } from "../Admin/Insurance/AdminManageInsurancePage";
import { currencize } from "../helpers/currencize";
import useLocale from "../Hooks/useLocale";
import CheckIcon from "../Icons/CheckIcon";
import ShieldIcon from "../Icons/ShieldIcon";
import WalletIcon from "../Icons/WalletIcon";
import Badge from "../UI/Badge";
import Button from "../UI/Button";
import IconTitle from "../UI/IconTitle";
import Ixon from "../UI/Ixon";
import { tsmRegular, txlBold } from "../UI/Typography";
import { InsurancePageNode } from "./InsurancePage";
import classes from "./InsurancePlans.module.css";

const PlanCard = ({ node }: { node: IInsurancePlan }) => {
  const getContent = useLocale();

  return (
    <div className={classes.item}>
      {!!node.isPopular && (
        <Badge
          color="Primary"
          size="S"
          radius="High"
          mode="Fill"
          className={classes.popular}
        >
          {getContent("popular")}
        </Badge>
      )}
      <IconTitle icon={<ShieldIcon />}>{node.name}</IconTitle>
      <span
        className={`${classes.price} ${txlBold}`}
      >{`${currencize(node.price)} / ${getContent("year")}`}</span>
      <div className={classes.features}>
        {node.features.map((f, i) => (
          <div className={classes.feature} key={i}>
            <Ixon width="1rem" className={classes.featureIcon}>
              <CheckIcon />
            </Ixon>
            <span className={`${classes.featureValue} ${tsmRegular}`}>{f}</span>
          </div>
        ))}
      </div>
      <Button
        variant="Primary"
        mode="Fill"
        size="M"
        radius="High"
        className={classes.action}
      >
        {getContent("purchaseOnline")}
      </Button>
    </div>
  );
};

const InsurancePlans = ({ node }: { node: InsurancePageNode }) => {
  const getContent = useLocale();

  if (!node.plans.length) return null;
  return (
    <div className={classes.main}>
      <IconTitle icon={<WalletIcon />}>
        {getContent("plansAndPrices")}
      </IconTitle>
      <div className={classes.list}>
        {node.plans.map((plan) => (
          <PlanCard key={plan._id} node={plan} />
        ))}
      </div>
    </div>
  );
};

export default InsurancePlans;
