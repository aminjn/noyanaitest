import { MouseEventHandler, ReactNode } from "react";
import PlusIcon from "../Icons/PlusIcon";
import Button from "../UI/Button";
import classes from "./DoctorPanelLicenseBalanceHeader.module.css";
import Ixon from "../UI/Ixon";
import usePopup from "../Hooks/usePopup";
import CartIcon from "../Icons/CartIcon";
import WalletIcon from "../Icons/WalletIcon";
import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "layoutDoctorLicenseBalance"];

const Card = ({
  action,
  actionTitle,
  bg,
  fg,
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  action: MouseEventHandler<HTMLButtonElement>;
  actionTitle: string;
  bg: string;
  fg: string;
}) => {
  return (
    <div className={classes.card} style={{ backgroundColor: bg }}>
      <div className={classes.details}>
        <div className={classes.header}>
          <Ixon width="1.25rem">{icon}</Ixon>
          <span>{title}</span>
        </div>
        <span className={classes.value} style={{ color: fg }}>
          {value}
        </span>
      </div>
      <div className={classes.action}>
        <Button
          style={{ backgroundColor: fg, color: "var(--onColor)" }}
          leadIcon={<PlusIcon />}
          onClick={action}
        >
          {actionTitle}
        </Button>
      </div>
    </div>
  );
};

const DoctorPanelLicenseBalanceHeader = () => {
  const { setPopup } = usePopup();

  const { data: balance } = useSWR<number>(`${API}/finance`, (url: string) =>
    fetcher({ url }).then((res) => res.data)
  );

  const getContent = useScopedLocale(LOCALE_NS);

  return (
    <div className={classes.main}>
      <Card
        bg="var(--primary2)"
        fg="var(--primary)"
        action={() => setPopup("LicensePppup", "LicensePopup")}
        actionTitle={getContent("buyLicense")}
        icon={<CartIcon />}
        title={getContent("currentLicense")}
        value={getContent("licenseInfoUnknown")}
      />
      <Card
        bg="var(--secondary1)"
        fg="var(--secondary)"
        action={() => setPopup("DepositPopup", "DepositPopup")}
        icon={<WalletIcon />}
        actionTitle={getContent("deposit")}
        title={getContent("currentBalance")}
        value={`${balance || 0} ${getContent("toman")}`}
      />
    </div>
  );
};

export default DoctorPanelLicenseBalanceHeader;
