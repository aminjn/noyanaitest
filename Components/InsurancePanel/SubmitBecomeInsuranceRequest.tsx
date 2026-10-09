import BecomeOrganizationForm, { becomeRequestFormValues } from "../Become/BecomeOrganizationForm";
import { becomeOrgs } from "../Become/becomeOrgs";
import { IBecomeInsuranceRequest } from "../Layout/InsurancePanelLayout";

const org = becomeOrgs.insurance;

// The panel's own "become a insurer" form (shown when the account has no
// insurer yet) is the same form as /become/insurance (2026-10): it used to be a
// second, generic form that asked fewer things (no licence expiry) and lost
// a declined request's values. The panel draws the request's status
// (BecomeRequestStatus); this is the form under it, prefilled from a
// declined request.
const SubmitBecomeInsuranceRequest = ({
  mutate,
  request,
}: {
  mutate: () => unknown;
  request?: IBecomeInsuranceRequest | null;
}) => (
  <BecomeOrganizationForm
    org={org}
    mutate={mutate}
    hideStatus
    rejected={request && request.status !== "Pending" ? becomeRequestFormValues(org, request) : undefined}
  />
);

export default SubmitBecomeInsuranceRequest;
