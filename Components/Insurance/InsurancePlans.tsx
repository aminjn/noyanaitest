import { IInsurancePlan } from "../Admin/Insurance/AdminManageInsurancePage";
import { currencize } from "../helpers/currencize";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
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

const NS: ContentNamespace[] = ["common", "insurancePage"];

// Where "ask for this plan" goes: the insurer's own inquiry form (a deal
// on its sales pipeline, the plan as its subject), else its phone, else
// its website. No such channel: no button (it used to be a dead "buy
// online" button - plans are not sold on NoyanAI).
const requestHref = (insurer: InsurancePageNode, plan: IInsurancePlan) => {
  if (insurer.requestForm)
    return `/f/${encodeURIComponent(insurer.requestForm)}?subject=${encodeURIComponent(plan.name || "")}`;
  const phone = String(insurer.phone || "")
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[^\d+]/g, "");
  if (phone) return `tel:${phone}`;
  const site = String(insurer.website || "").trim();
  if (/^https?:\/\//i.test(site)) return site;
  return null;
};

const PlanCard = ({
  node,
  insurer,
}: {
  node: IInsurancePlan;
  insurer: InsurancePageNode;
}) => {
  const getContent = useScopedLocale(NS);
  const href = requestHref(insurer, node);
  const features = Array.isArray(node.features) ? node.features : [];

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
      {/* a plan without a premium (a basic insurer's scheme) shows none */}
      {(node.price || 0) > 0 && (
        <span
          className={`${classes.price} ${txlBold}`}
        >{`${currencize(node.price)} / ${getContent("year")}`}</span>
      )}
      <div className={classes.features}>
        {features.map((f, i) => (
          <div className={classes.feature} key={i}>
            <Ixon width="1rem" className={classes.featureIcon}>
              <CheckIcon />
            </Ixon>
            <span className={`${classes.featureValue} ${tsmRegular}`}>{f}</span>
          </div>
        ))}
      </div>
      {!!href && (
        <Button
          variant="Primary"
          mode="Fill"
          size="M"
          radius="High"
          className={classes.action}
          href={href}
        >
          {getContent("insPlanRequest")}
        </Button>
      )}
    </div>
  );
};

const InsurancePlans = ({ node }: { node: InsurancePageNode }) => {
  const getContent = useScopedLocale(NS);

  const plans = Array.isArray(node.plans) ? node.plans : [];
  if (!plans.length) return null;
  return (
    <div className={classes.main}>
      <IconTitle icon={<WalletIcon />}>
        {getContent("plansAndPrices")}
      </IconTitle>
      <div className={classes.list}>
        {plans.map((plan) => (
          <PlanCard key={plan._id} node={plan} insurer={node} />
        ))}
      </div>
    </div>
  );
};

export default InsurancePlans;
