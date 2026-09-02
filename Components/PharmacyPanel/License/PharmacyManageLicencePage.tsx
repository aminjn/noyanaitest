"use client";

import useSWR from "swr";
import classes from "./PharmacyManageLicencePage.module.css";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useLocale from "@/Components/Hooks/useLocale";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { currencize } from "@/Components/helpers/currencize";
import { MongoDoc } from "@/Components/Hooks/useUser";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import usePopup from "@/Components/Hooks/usePopup";
import Badge from "@/Components/UI/Badge";
import Button from "@/Components/UI/Button";
import IconTitle from "@/Components/UI/IconTitle";
import Ixon from "@/Components/UI/Ixon";
import CheckIcon from "@/Components/Icons/CheckIcon";
import CartIcon from "@/Components/Icons/CartIcon";
import WalletIcon from "@/Components/Icons/WalletIcon";
import { tsmRegular, txlBold } from "@/Components/UI/Typography";
import {
  PharmacyDashboardModule,
  pharmacyDashboardModuleLabels,
} from "@/Components/Admin/BasePharmacyLicense/AdminManageBasePharmacyLicensesPage";
import PurchaseLicensePopup from "./PurchaseLicensePopup";

// Mirrors backend Models/BasePharmacyLicense.ts - the admin-managed catalog
// of purchasable license tiers. Mirrors
// Components/DoctorPanel/_Stub/DoctorManageLicencePage.tsx's own
// IBaseDoctorLicense.
export interface IBasePharmacyLicense extends MongoDoc {
  displayName?: string;
  order: number;
  monthlyPrice: number;
  monthlyDiscount: number;
  annualPrice: number;
  annualDiscount: number;
  descriptions: string[];
  modules: PharmacyDashboardModule[];
}

export const licensePeriods = ["monthly", "annual"] as const;
export type LicensePeriod = (typeof licensePeriods)[number];

// Mirrors backend Models/PharmacyProfileLicense.ts - the pharmacy's own
// current license record (one per pharmacy), which only tracks which
// modules are currently unlocked (plus a display label), not which catalog
// tier or period it came from. Exported so other pharmacy-panel pages (e.g.
// the dashboard's CurrentLicenseWidget) can show it without refetching or
// redeclaring the shape.
export interface IPharmacyProfileLicense extends MongoDoc {
  displayName?: string;
  modules: PharmacyDashboardModule[];
}

interface ILicenseOverview {
  catalog: IBasePharmacyLicense[];
  current: IPharmacyProfileLicense | null;
}

const PriceOption = ({
  node,
  period,
  price,
  mutate,
}: {
  node: IBasePharmacyLicense;
  period: LicensePeriod;
  price: number;
  mutate: () => unknown;
}) => {
  const getContent = useLocale();
  const { setPopup } = usePopup();

  return (
    <div className={classes.priceOption}>
      <div className={classes.priceOptionInfo}>
        <span className={`${classes.price} ${txlBold}`}>
          {`${currencize(price)} ${getContent("toman")}`}
        </span>
        <span className={tsmRegular}>{getContent(period)}</span>
      </div>
      <Button
        variant="Primary"
        mode="Fill"
        size="M"
        radius="High"
        onClick={() =>
          setPopup(
            "PurchaseLicense",
            <PurchaseLicensePopup
              node={node}
              period={period}
              mutate={mutate}
            />,
          )
        }
      >
        {getContent("buyLicense")}
      </Button>
    </div>
  );
};

const LicenseCard = ({
  node,
  mutate,
}: {
  node: IBasePharmacyLicense;
  mutate: () => unknown;
}) => {
  const monthlyPrice = Math.max(
    0,
    (node.monthlyPrice || 0) - (node.monthlyDiscount || 0),
  );
  const annualPrice = Math.max(
    0,
    (node.annualPrice || 0) - (node.annualDiscount || 0),
  );

  return (
    <div className={classes.item}>
      <IconTitle icon={<CartIcon />}>{node.displayName}</IconTitle>
      <div className={classes.features}>
        {node.descriptions.map((d, i) => (
          <div className={classes.feature} key={i}>
            <Ixon width="1rem" className={classes.featureIcon}>
              <CheckIcon />
            </Ixon>
            <span className={`${classes.featureValue} ${tsmRegular}`}>{d}</span>
          </div>
        ))}
      </div>
      <div className={classes.priceOptions}>
        <PriceOption
          node={node}
          period="monthly"
          price={monthlyPrice}
          mutate={mutate}
        />
        <PriceOption
          node={node}
          period="annual"
          price={annualPrice}
          mutate={mutate}
        />
      </div>
    </div>
  );
};

const PharmacyManageLicencePage = () => {
  const getContent = useLocale();

  const { data, error, mutate } = useSWR<ILicenseOverview>(
    `${API}/pharmacy/license`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const { data: balance } = useSWR<number>(`${API}/finance`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  useBreadCrump([
    { title: getContent("dashboard"), target: "/pharmacypanel" },
    { title: getContent("licenses"), target: "/pharmacypanel/license" },
  ]);

  return (
    <div className={classes.main}>
      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <WithTitle
            title={getContent("licenses")}
            collapsed={
              balance !== undefined ? (
                <span className={`${classes.balance} ${tsmRegular}`}>
                  <Ixon width="1rem">
                    <WalletIcon />
                  </Ixon>
                  <span>{getContent("currentBalance")}:</span>
                  <span>{`${currencize(balance)} ${getContent("toman")}`}</span>
                </span>
              ) : undefined
            }
          >
            {!!data.current && (
              <div className={classes.current}>
                <IconTitle icon={<WalletIcon />}>
                  {`${getContent("currentLicense")}${
                    data.current.displayName
                      ? `: ${data.current.displayName}`
                      : ""
                  }`}
                </IconTitle>
                {!!data.current.modules.length && (
                  <div className={classes.currentModules}>
                    {data.current.modules.map((m) => (
                      <Badge key={m} color="Primarylight" size="S">
                        {pharmacyDashboardModuleLabels[m]}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className={classes.list}>
              {data.catalog.map((node) => (
                <LicenseCard key={node._id} node={node} mutate={mutate} />
              ))}
            </div>
          </WithTitle>
        )}
      </HandleLoading>
    </div>
  );
};

export default PharmacyManageLicencePage;
