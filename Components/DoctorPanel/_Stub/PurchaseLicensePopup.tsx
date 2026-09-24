"use client";

import { Fragment, useState } from "react";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import {
  IBaseDoctorLicense,
  IBaseLicensePricing,
} from "./DoctorManageLicencePage";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelLicense"];

// Confirm-then-Act purchase flow, same pattern as
// Components/DoctorPanel/Clinic/UnjoinClinicPopup.tsx - POSTs to
// doctorController.purchaseLicense with the chosen LicenseDuration id
// (2026-09, replacing the old monthly/annual period toggle), which debits
// the doctor's wallet for that duration's price and replaces their
// DoctorProfileLicense.displayName/modules with this tier's own.
const PurchaseLicensePopup = ({
  mutate,
  node,
  option,
}: {
  node: IBaseDoctorLicense;
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
        path={isLoading ? `${API}/doctor/license/${node._id}` : null}
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
