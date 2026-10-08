import CreateForm from "@/Components/Admin/UI/CreateForm";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import { API } from "@/Components/config";
import usePharmacy from "@/Components/Hooks/usePharmacy";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "openingHours", "pharmacyPanelProfile"];

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
            // the structured week (2026-10): round the clock is part of it;
            // the text is the note under it
            openingHours: { type: "openingHours", title: getContent("ohEditorTitle") },
            businessTime: { type: "text", title: getContent("ohNoteField") },
            // the insurers are contracts now: the «بیمه‌ها» tab (2026-10)
          }}
        />
      )}
    </HandleLoading>
  );
};

export default PharmacyManageDetailsTab;
