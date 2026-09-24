import CreateForm from "@/Components/Admin/UI/CreateForm";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import { API } from "@/Components/config";
import usePharmacy from "@/Components/Hooks/usePharmacy";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "pharmacyPanelProfile"];

const PharmacyManageDetailsTab = () => {
  const { pharmacy, mutate } = usePharmacy();

  const getContent = useScopedLocale(NS);

  return (
    <HandleLoading data={!!pharmacy}>
      {!!pharmacy && (
        <CreateForm
          style={{ width: "100%" }}
          defaultValue={pharmacy}
          hookProps={{
            path: `${API}/pharmacy/profile`,
            method: "POST",
            successCb: () => {
              mutate();
            },
          }}
          renderer={{
            name: { type: "text", title: getContent("name") },
            avatar: { type: "image", title: getContent("avatar") },
            banner: { type: "image", title: getContent("banner") },
            summary: { type: "area", title: getContent("summary") },
            address: { type: "text", title: getContent("address") },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default PharmacyManageDetailsTab;
