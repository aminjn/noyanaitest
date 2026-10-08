import CreateForm from "../Admin/UI/CreateForm";
import { API } from "../config";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { IBecomeInsuranceRequest } from "../Layout/InsurancePanelLayout";

const NS: ContentNamespace[] = ["common", "becomeInsurance"];

const SubmitBecomeInsuranceRequest = ({
  mutate,
}: {
  mutate: () => unknown;
}) => {
  const getContent = useScopedLocale(NS);
  return (
    <CreateForm<IBecomeInsuranceRequest>
      renderer={{
        name: { type: "text", title: getContent("name") },
        licenseNumber: { type: "text", title: getContent("insurerLicenseNumber"), required: true },
        certificateDate: {
          type: "date",
          title: getContent("certificateDate"),
        },
        certificateFile: {
          type: "image",
          title: getContent("certificateFile"),
        },
        description: { type: "text", title: getContent("description") },
      }}
      hookProps={{
        path: `${API}/insurance/`,
        method: "POST",
        successCb: () => {
          mutate();
        },
      }}
    />
  );
};

export default SubmitBecomeInsuranceRequest;
