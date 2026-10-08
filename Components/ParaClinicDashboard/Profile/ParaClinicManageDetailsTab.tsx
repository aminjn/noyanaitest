import CreateForm from "@/Components/Admin/UI/CreateForm";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import { API } from "@/Components/config";
import useParaClinic from "@/Components/Hooks/useParaClinic";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { IParaClinicTag } from "@/Components/Admin/ParaClinicTag/AdminManageParaClinicTagsPage";
import { IParaClinicCategory } from "@/Components/Admin/ParaClinicCategory/AdminManageParaClinicCategoriesPage";

const NS: ContentNamespace[] = ["common", "openingHours", "paraClinicPanelProfile"];

const ParaClinicManageDetailsTab = () => {
  const { paraClinic, mutate } = useParaClinic();

  const getContent = useScopedLocale(NS);

  return (
    <HandleLoading data={!!paraClinic}>
      {!!paraClinic && (
        <CreateForm
          style={{ width: "100%" }}
          defaultValue={paraClinic}
          hookProps={{
            path: `${API}/paraClinic/profile`,
            method: "POST",
            successCb: () => {
              mutate();
            },
          }}
          renderer={{
            name: { type: "text", title: getContent("name") },
            image: { type: "image", title: getContent("image") },
            category: {
              type: "nodes",
              title: getContent("category"),
              path: `${API}/public/paraClinicCategory`,
              getOptionLabel: (node) =>
                (node as IParaClinicCategory).name ||
                (node as IParaClinicCategory)._id,
              getOptionValue: (node) => (node as IParaClinicCategory)._id,
              getDefaultValue: (inp) => inp.category,
              multi: false,
            },
            tags: {
              type: "nodes",
              title: getContent("tags"),
              path: `${API}/public/selectparaclinictag`,
              getOptionLabel: (node) =>
                (node as IParaClinicTag).name || (node as IParaClinicTag)._id,
              getOptionValue: (node) => (node as IParaClinicTag)._id,
              getDefaultValue: (inp) => inp.tags,
              multi: true,
            },
            establishment: { type: "text", title: getContent("establishment") },
            // the structured week (2026-10); the text is the note under it
            openingHours: { type: "openingHours", title: getContent("ohEditorTitle") },
            businessTime: { type: "text", title: getContent("ohNoteField") },
            phone: { type: "text", title: getContent("phone") },
            // «نمونه‌گیری در محل» is no longer typed here (2026-10): it follows
            // the home-sampling switch of «نمونه‌گیری» > settings
            onPremises: {
              type: "bool",
              title: getContent("onPremises"),
              readOnly: true,
              hint: getContent("lsOnPremisesHint"),
            },
            onlineResponse: { type: "bool", title: getContent("onlineResponse") },
            personelCount: { type: "number", title: getContent("personelCount") },
            summary: { type: "area", title: getContent("summary") },
            // the insurers are contracts now: the «بیمه‌ها» tab (2026-10)
          }}
        />
      )}
    </HandleLoading>
  );
};

export default ParaClinicManageDetailsTab;
