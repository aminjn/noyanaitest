import CreateForm from "../Admin/UI/CreateForm";
import { API } from "../config";
import useLocale from "../Hooks/useLocale";
import { IBecomePharmacyRequest } from "./BecomePharmacyPage";

const SubmitBecomePharmacyRequest = ({ mutate }: { mutate: () => unknown }) => {
  const getContent = useLocale();

  return (
    <CreateForm<IBecomePharmacyRequest>
      renderer={{ name: { type: "text", title: getContent("name") } }}
      hookProps={{
        path: `${API}/pharmacy`,
        method: "POST",
        successCb: () => {
          mutate();
        },
      }}
    />
  );
};

export default SubmitBecomePharmacyRequest;
