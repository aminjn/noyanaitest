import CreateForm from "../Admin/UI/CreateForm";
import { API } from "../config";
import useLocale from "../Hooks/useLocale";
import { IBecomeClinicRequest } from "./BecomeClinicPage";

const SubmitBecomeClinicRequest = ({ mutate }: { mutate: () => unknown }) => {
  const getContent = useLocale();
  return (
    <CreateForm<IBecomeClinicRequest>
      renderer={{ name: { type: "text", title: getContent("name") } }}
      hookProps={{
        path: `${API}/clinic`,
        method: "POST",
        successCb: () => {
          mutate();
        },
      }}
    />
  );
};

export default SubmitBecomeClinicRequest;
