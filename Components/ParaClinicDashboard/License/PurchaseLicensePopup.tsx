"use client";

import { Fragment, useState } from "react";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import {
  IBaseParaClinicLicense,
  IBaseLicensePricing,
} from "./ParaClinicManageLicencePage";

const NS: ContentNamespace[] = ["common", "paraClinicPanelLicense"];

// Confirm-then-Act purchase flow, same pattern as
// Components/PharmacyPanel/License/PurchaseLicensePopup.tsx - POSTs to
// paraClinicController.purchaseLicense with the chosen LicenseDuration id
// (2026-09, replacing the old monthly/annual period toggle), which debits
// the paraClinic's wallet for that duration's price and replaces their
// ParaClinicProfileLicense.displayName/modules with this tier's own.
const PurchaseLicensePopup = ({
  mutate,
  node,
  option,
}: {
  node: IBaseParaClinicLicense;
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
        path={isLoading ? `${API}/paraClinic/license/${node._id}` : null}
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
