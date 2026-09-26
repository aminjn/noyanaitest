"use client";

import classes from "./AllLicensePlansPage.module.css";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import {
  IActiveLicenseCatalog,
  ILicenseDuration,
  LicenseOrg,
  licenseModuleLabelsByOrg,
  licensePanelRootByOrg,
} from "./licenseTypes";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import { useEffect, useState } from "react";
import Table, { TableRenderer } from "@/Components/Admin/UI/Table";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import { currencize } from "@/Components/helpers/currencize";
import { IBaseLicense } from "./licenseTypes";
import LicenseDurationSelector from "./LicenseDurationSelector";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconLink from "@/Components/Admin/UI/IconLink";
import EyeIcon from "@/Components/Icons/EyeIcon";
import { t3xlBold, txsRegular } from "@/Components/UI/Typography";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "sharedLicense"];

// Shared logic for the "/<panel>/license/all" page across every org panel
// (doctor/pharmacy/clinic/paraClinic) - fetches every isActive plan for
// that org regardless of isPrimary (sorted by order) from
// <org>Controller.getActiveLicenses, along with every LicenseDuration
// referenced by at least one of those plans' pricing options. JSX/styling
// intentionally left for a follow-up pass.
const AllLicensePlansPage = ({ name }: { name: LicenseOrg }) => {
  const { data, error } = useSWR<IActiveLicenseCatalog>(
    `${API}/${name}/license/all`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const getContent = useScopedLocale(LOCALE_NS);

  const [selectedDuration, setSelectedDuration] =
    useState<ILicenseDuration | null>(null);

  useEffect(() => {
    if (!!selectedDuration || !data?.durations.length) return;
    setSelectedDuration(data.durations[0]);
  }, [selectedDuration, data]);

  // Looks up a plan's pricing option for the currently-selected duration -
  // undefined if that plan doesn't offer this duration at all (its pricing
  // entry is missing outright, not just isActive: false - getActiveLicenses
  // already only returns plans it considers sellable).
  const getPricingOption = (node: IBaseLicense) =>
    selectedDuration
      ? node.pricing.find((p) => p.duration === selectedDuration._id)
      : undefined;

  // TODO: render `licenses`/`durations` (full plan list + duration picker)
  // once the JSX/CSS pass for this page happens. `error`/`isLoading` are
  // already wired up above for that pass's loading/error states.
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <div className={classes.header}>
            <h1 className={`${classes.h1} ${t3xlBold}`}>
              {getContent("selectNoyanLicense")}
            </h1>
            <legend className={`${classes.legend} ${txsRegular}`}>
              {getContent("selectNoyanLicenseLegend")}
            </legend>
            <LicenseDurationSelector
              durations={data.durations}
              selectedDuration={selectedDuration}
              onSelect={setSelectedDuration}
              className={classes.durationSelector}
            />
          </div>
          <div className={classes.table}>
            <Table
              data={data.licenses}
              renderer={
                {
                  displayName: {
                    name: getContent("name"),
                    value: (node) => node.displayName,
                    filter: "Text",
                  },
                  price: {
                    name: getContent("price"),
                    value: (node) => {
                      const option = getPricingOption(node);
                      return option ? currencize(option.price || 0) : "";
                    },
                    filter: "Number",
                  },
                  discount: {
                    name: getContent("discount"),
                    value: (node) => {
                      const option = getPricingOption(node);
                      return option ? currencize(option.discount || 0) : "";
                    },
                    filter: "Number",
                  },
                  finalPrice: {
                    name: getContent("payablePrice"),
                    value: (node) => {
                      const option = getPricingOption(node);
                      if (!option) return "";
                      return currencize(
                        Math.max(
                          0,
                          (option.price || 0) - (option.discount || 0),
                        ),
                      );
                    },
                    filter: "Number",
                  },
                  ...Object.fromEntries(
                    data.modules.map((mod) => [
                      mod,
                      {
                        name: licenseModuleLabelsByOrg[name][mod] || mod,
                        value: (node) =>
                          booleanToValue[`${node.modules.includes(mod)}`],
                        component: (node) => (
                          <BooleanToIcon value={node.modules.includes(mod)} />
                        ),
                        filter: "Set",
                      },
                    ]),
                  ),
                  actions: {
                    name: getContent("actions"),
                    component: (node) => (
                      <TableActions>
                        <IconLink
                          href={`${licensePanelRootByOrg[name]}/license/${node._id}`}
                        >
                          <EyeIcon />
                        </IconLink>
                      </TableActions>
                    ),
                  },
                } satisfies TableRenderer<IBaseLicense>
              }
            />
          </div>
        </div>
      )}
    </HandleLoading>
  );
};

export default AllLicensePlansPage;
