import CreateForm from "../Admin/UI/CreateForm";
import { API } from "../config";
import useLocale from "../Hooks/useLocale";
import { IBecomeHospitalRequest } from "./BecomeHospitalPage";

const SubmitBecomeHospitalRequest = ({ mutate }: { mutate: () => unknown }) => {
  const getContent = useLocale();
  return (
    <CreateForm<IBecomeHospitalRequest>
      renderer={{
        name: { type: "text", title: getContent("name") },
        siamCode: { type: "text", title: getContent("siamCode") },
        nationalId: { type: "text", title: getContent("nationalId") },
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
        path: `${API}/hospital`,
        method: "POST",
        successCb: () => {
          mutate();
        },
      }}
    />
  );
};

export default SubmitBecomeHospitalRequest;
