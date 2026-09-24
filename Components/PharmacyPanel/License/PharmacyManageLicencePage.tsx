"use client";

import useSWR from "swr";
import classes from "./PharmacyManageLicencePage.module.css";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
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

const NS: ContentNamespace[] = ["common", "pharmacyPanelLicense"];

// Mirrors backend Models/LicenseDuration.ts - the admin-managed catalog of
// selectable license durations (in days), populated onto each pricing
// option below via pharmacyController.getMyLicenseOverview.
export interface ILicenseDuration extends MongoDoc {
  duration: number;
  displayName?: string;
}

// Mirrors backend Models/BaseLicensePricing.ts - one pricing option per
// LicenseDuration a plan is offered at (2026-09, replacing the old flat
// monthlyPrice/monthlyDiscount/annualPrice/annualDiscount fields).
export interface IBaseLicensePricing {
  duration: ILicenseDuration;
  isActive: boolean;
  price: number;
  discount: number;
}

// Mirrors backend Models/BasePharmacyLicense.ts - the admin-managed catalog
// of purchasable license tiers. Mirrors
// Components/DoctorPanel/_Stub/DoctorManageLicencePage.tsx's own
// IBaseDoctorLicense.
export interface IBasePharmacyLicense extends MongoDoc {
  displayName?: string;
  order: number;
  pricing: IBaseLicensePricing[];
  descriptions: string[];
  modules: PharmacyDashboardModule[];
}

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
  option,
  mutate,
}: {
  node: IBasePharmacyLicense;
  option: IBaseLicensePricing;
  mutate: () => unknown;
}) => {
  const getContent = useScopedLocale(NS);
  const { setPopup } = usePopup();
  const price = Math.max(0, (option.price || 0) - (option.discount || 0));

  return (
    <div className={classes.priceOption}>
      <div className={classes.priceOptionInfo}>
        <span className={`${classes.price} ${txlBold}`}>
          {`${currencize(price)} ${getContent("toman")}`}
        </span>
        <span className={tsmRegular}>
          {option.duration.displayName || `${option.duration.duration} روز`}
        </span>
      </div>
      <Button
        variant="Primary"
        mode="Fill"
        size="M"
        radius="High"
        onClick={() =>
          setPopup(
            "PurchaseLicense",
            <PurchaseLicensePopup node={node} option={option} mutate={mutate} />,
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
  const activeOptions = node.pricing.filter((p) => p.isActive);

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
        {activeOptions.map((option) => (
          <PriceOption
            key={option.duration._id}
            node={node}
            option={option}
            mutate={mutate}
          />
        ))}
      </div>
    </div>
  );
};

const PharmacyManageLicencePage = () => {
  const getContent = useScopedLocale(NS);

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
