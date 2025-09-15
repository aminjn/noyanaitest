import CreateForm from "../Admin/UI/CreateForm";
import { API } from "../config";
import useLocale from "../Hooks/useLocale";
import { IBecomeInsuranceRequest } from "../Layout/InsurancePanelLayout";

const SubmitBecomeInsuranceRequest = ({
  mutate,
}: {
  mutate: () => unknown;
}) => {
  const getContent = useLocale();
  return (
    <CreateForm<IBecomeInsuranceRequest>
      renderer={{ name: { type: "text", title: getContent("name") } }}
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
