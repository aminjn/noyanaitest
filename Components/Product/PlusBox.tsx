import { currencize } from "../helpers/currencize";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import StarsSolidIcon from "../Icons/StarsSolidIcon";
import Badge from "../UI/Badge";
import Button from "../UI/Button";
import { tsmRegular } from "../UI/Typography";
import classes from "./PlusBox.module.css";

const NS: ContentNamespace[] = ["common", "productCartable"];

const PlusBox = ({ value }: { value: number }) => {
  const getContent = useScopedLocale(NS);

  return (
    <div className={classes.plusBox}>
      <Badge
        leadIcon={<StarsSolidIcon />}
        size="L"
        mode="Fill"
        color="SecondaryLight"
      >
        {getContent("plusMembers")}
      </Badge>
      <p className={`${classes.plusText} ${tsmRegular}`}>
        <span>{getContent("plusTextPre")}</span>
        <span className={classes.plusPrice}>
          {getContent("xToman", [currencize(value)])}
        </span>
        <span>{getContent("plusTextPost")}</span>
      </p>
      <Button variant="Primary" mode="Fill" size="M" radius="Medium">
        {getContent("seeOtherBenefits")}
      </Button>
    </div>
  );
};

export default PlusBox;
