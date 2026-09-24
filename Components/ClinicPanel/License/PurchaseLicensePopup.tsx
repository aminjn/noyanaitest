"use client";

import { Fragment, useState } from "react";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import {
  IBaseClinicLicense,
  IBaseLicensePricing,
} from "./ClinicManageLicencePage";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "clinicPanelLicense"];

// Confirm-then-Act purchase flow, same pattern as
// Components/PharmacyPanel/License/PurchaseLicensePopup.tsx - POSTs to
// clinicController.purchaseLicense with the chosen LicenseDuration id
// (2026-09, replacing the old monthly/annual period toggle), which debits
// the clinic's wallet for that duration's price and replaces their
// ClinicProfileLicense.displayName/modules with this tier's own.
const PurchaseLicensePopup = ({
  mutate,
  node,
  option,
}: {
  node: IBaseClinicLicense;
  option: IBaseLicensePricing;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const getContent = useScopedLocale(NS);

  const { closePopup } = usePopup();

  return (
    <Fragment>
      <ConfirmationPopup
        message={getContent("buyLicenseConfirmationMessage", [
          node.displayName || "",
          option.duration.displayName || "",
        ])}
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/clinic/license/${node._id}` : null}
        method="POST"
        payload={{ duration: option.duration._id }}
        onDone={(status) => {
          setIsLoading(false);
          if (!status) return;
          mutate();
          closePopup();
        }}
      />
    </Fragment>
  );
};

export default PurchaseLicensePopup;
