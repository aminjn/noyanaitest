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
            // what a buyer asks before ordering (2026-10), like the lab's
            phone: { type: "text", title: getContent("phone") },
            businessTime: { type: "text", title: getContent("businessTime") },
            isRoundTheClock: { type: "bool", title: getContent("roundTheClock") },
            insurances: {
              type: "nodes",
              title: getContent("insurances"),
              path: `${API}/public/insurance`,
              getOptionLabel: (node) => (node as { name?: string; _id: string }).name || (node as { _id: string })._id,
              getOptionValue: (node) => (node as { _id: string })._id,
              getDefaultValue: (inp) => inp.insurances,
              multi: true,
            },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default PharmacyManageDetailsTab;
