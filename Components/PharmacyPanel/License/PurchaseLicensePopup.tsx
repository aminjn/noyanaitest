"use client";

import { Fragment, useState } from "react";
import useLocale from "@/Components/Hooks/useLocale";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import { IBasePharmacyLicense, LicensePeriod } from "./PharmacyManageLicencePage";

// Confirm-then-Act purchase flow, same pattern as
// Components/DoctorPanel/_Stub/PurchaseLicensePopup.tsx - POSTs to
// pharmacyController.purchaseLicense with the chosen billing period, which
// debits the pharmacy's wallet for that period's price and replaces their
// PharmacyProfileLicense.displayName/modules with this tier's own.
const PurchaseLicensePopup = ({
  mutate,
  node,
  period,
}: {
  node: IBasePharmacyLicense;
  period: LicensePeriod;
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
          getContent(period),
        ])}
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/pharmacy/license/${node._id}` : null}
        method="POST"
        payload={{ period }}
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
