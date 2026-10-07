import { useMemo } from "react";
import useLocale from "@/Components/Hooks/useLocale";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { BreakdownTexts } from "./InsuranceBreakdown";

const reasonKey: Record<string, ContentKey> = {
  noTariff: "ibReasonNoTariff",
  limit: "ibReasonLimit",
  notEligible: "ibReasonNotEligible",
};

// InsuranceBreakdown's texts on the site and the provider panels (content
// keys; the admin panel passes its own ta() texts)
const useBreakdownTexts = (): BreakdownTexts => {
  const getContent = useLocale();
  return useMemo(
    () => ({
      title: getContent("ibTitle"),
      price: getContent("ibVisitPrice"),
      basic: getContent("bfInsBasic"),
      supplementary: getContent("bfInsSupp"),
      patientShare: getContent("ibPatientShare"),
      paidOnline: getContent("ibPaidOnline"),
      paidDesk: getContent("ibPaidDesk"),
      deskPaid: getContent("ibDeskPaid"),
      status: {
        pending: getContent("ibStPending"),
        booked: getContent("ibStBooked"),
        cancelled: getContent("ibStCancelled"),
        reversed: getContent("ibStReversed"),
        desk: getContent("ibStDesk"),
        none: getContent("ibStNone"),
      },
      reason: (r: string) => getContent(reasonKey[r] || "ibReasonNoTariff"),
      viaCentre: (name: string) => getContent("ibViaCentre", [name]),
      verified: getContent("bfInsVerified"),
      onClaim: getContent("ibOnClaim"),
      estimate: getContent("bfInsEstimate"),
    }),
    [getContent],
  );
};

export default useBreakdownTexts;
