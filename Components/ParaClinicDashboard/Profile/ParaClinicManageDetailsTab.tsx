import CreateForm from "@/Components/Admin/UI/CreateForm";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import { API } from "@/Components/config";
import useParaClinic from "@/Components/Hooks/useParaClinic";
import useLocale from "@/Components/Hooks/useLocale";
import { IParaClinicTag } from "@/Components/Admin/ParaClinicTag/AdminManageParaClinicTagsPage";
import { IParaClinicCategory } from "@/Components/Admin/ParaClinicCategory/AdminManageParaClinicCategoriesPage";
import { IInsurance } from "@/Components/DoctorPanel/Insurance/DoctorInsurancesTab";

const ParaClinicManageDetailsTab = () => {
  const { paraClinic, mutate } = useParaClinic();

  const getContent = useLocale();

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
            businessTime: { type: "text", title: getContent("businessTime") },
            phone: { type: "text", title: getContent("phone") },
            onPremises: { type: "bool", title: getContent("onPremises") },
            onlineResponse: { type: "bool", title: getContent("onlineResponse") },
            basicInsurance: { type: "bool", title: getContent("basicInsurance") },
            personelCount: { type: "number", title: getContent("personelCount") },
            summary: { type: "area", title: getContent("summary") },
            insurances: {
              type: "nodes",
              title: getContent("insurances"),
              path: `${API}/public/insurance`,
              getOptionLabel: (node) =>
                (node as IInsurance).name || (node as IInsurance)._id,
              getOptionValue: (node) => (node as IInsurance)._id,
              getDefaultValue: (inp) => inp.insurances,
              multi: true,
            },
            address: { type: "text", title: getContent("address") },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default ParaClinicManageDetailsTab;
