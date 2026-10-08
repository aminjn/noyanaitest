import CreateForm from "@/Components/Admin/UI/CreateForm";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import { API } from "@/Components/config";
import useHospital from "@/Components/Hooks/useHospital";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { IHospitalTag } from "@/Components/Admin/HospitalTag/AdminManageHospitalTagsPage";
import { IHospitalCategory } from "@/Components/Admin/HospitalCategory/AdminManageHospitalCategoriesPage";

const NS: ContentNamespace[] = ["common", "openingHours", "hospitalPanelProfile"];

const HospitalManageDetailsTab = () => {
  const { hospital, mutate } = useHospital();

  const getContent = useScopedLocale(NS);

  return (
    <HandleLoading data={!!hospital}>
      {!!hospital && (
        <CreateForm
          style={{ width: "100%" }}
          defaultValue={hospital}
          hookProps={{
            path: `${API}/hospital/profile`,
            method: "POST",
            successCb: () => {
              mutate();
            },
          }}
          renderer={{
            name: { type: "text", title: getContent("name") },
            image: { type: "image", title: getContent("image") },
            summary: { type: "area", title: getContent("summary") },
            category: {
              type: "nodes",
              title: getContent("category"),
              path: `${API}/public/hospitalCategory`,
              getOptionLabel: (node) =>
                (node as IHospitalCategory).name || (node as IHospitalCategory)._id,
              getOptionValue: (node) => (node as IHospitalCategory)._id,
              getDefaultValue: (inp) => inp.category,
              multi: false,
            },
            tags: {
              type: "nodes",
              title: getContent("tags"),
              path: `${API}/public/selecthospitaltag`,
              getOptionLabel: (node) =>
                (node as IHospitalTag).name || (node as IHospitalTag)._id,
              getOptionValue: (node) => (node as IHospitalTag)._id,
              getDefaultValue: (inp) => inp.tags,
              multi: true,
            },
            establishment: { type: "text", title: getContent("establishment") },
            // the structured week (2026-10); the text is the note under it
            openingHours: { type: "openingHours", title: getContent("ohEditorTitle") },
            businessTimes: { type: "text", title: getContent("ohNoteField") },
            phone: { type: "text", title: getContent("phone") },
            mail: { type: "text", title: getContent("mail") },
            website: { type: "text", title: getContent("website") },
            personelCount: { type: "number", title: getContent("personelCount") },
            bedCount: { type: "number", title: getContent("mcBeds") },
            services: { type: "strings", title: getContent("services") },
            certificates: { type: "strings", title: getContent("certificates") },
            // the insurers are contracts now: the «بیمه‌ها» tab (2026-10)
          }}
        />
      )}
    </HandleLoading>
  );
};

export default HospitalManageDetailsTab;
