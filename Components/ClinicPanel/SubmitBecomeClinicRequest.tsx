import CreateForm from "../Admin/UI/CreateForm";
import { API } from "../config";
import useScopedLocale from "../Hooks/useScopedLocale";
import { IBecomeClinicRequest } from "./BecomeClinicPage";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "becomeClinic"];

const SubmitBecomeClinicRequest = ({ mutate }: { mutate: () => unknown }) => {
  const getContent = useScopedLocale(NS);
  return (
    <CreateForm<IBecomeClinicRequest>
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
