import CreateForm from "../Admin/UI/CreateForm";
import { API } from "../config";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { IBecomePharmacyRequest } from "./BecomePharmacyPage";

const NS: ContentNamespace[] = ["common", "becomePharmacy"];

const SubmitBecomePharmacyRequest = ({ mutate }: { mutate: () => unknown }) => {
  const getContent = useScopedLocale(NS);

  return (
    <CreateForm<IBecomePharmacyRequest>
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
