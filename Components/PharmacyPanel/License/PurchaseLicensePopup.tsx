"use client";

import { Fragment, useState } from "react";
import useLocale from "@/Components/Hooks/useLocale";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import {
  IBasePharmacyLicense,
  IBaseLicensePricing,
} from "./PharmacyManageLicencePage";

// Confirm-then-Act purchase flow, same pattern as
// Components/DoctorPanel/_Stub/PurchaseLicensePopup.tsx - POSTs to
// pharmacyController.purchaseLicense with the chosen LicenseDuration id
// (2026-09, replacing the old monthly/annual period toggle), which debits
// the pharmacy's wallet for that duration's price and replaces their
// PharmacyProfileLicense.displayName/modules with this tier's own.
const PurchaseLicensePopup = ({
  mutate,
  node,
  option,
}: {
  node: IBasePharmacyLicense;
  option: IBaseLicensePricing;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const getContent = useLocale();

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
        path={isLoading ? `${API}/pharmacy/license/${node._id}` : null}
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
