import CreateForm from "@/Components/Admin/UI/CreateForm";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import { API } from "@/Components/config";
import useClinic from "@/Components/Hooks/useClinic";
import useLocale from "@/Components/Hooks/useLocale";
import { IClinicTag } from "@/Components/Admin/ClinicTag/AdminManageClinicTagsPage";
import { IClinicCategory } from "@/Components/Admin/ClinicCategory/AdminManageClinicCategoriesPage";
import { IInsurance } from "@/Components/DoctorPanel/Insurance/DoctorInsurancesTab";

const ClinicManageDetailsTab = () => {
  const { clinic, mutate } = useClinic();

  const getContent = useLocale();

  return (
    <HandleLoading data={!!clinic}>
      {!!clinic && (
        <CreateForm
          style={{ width: "100%" }}
          defaultValue={clinic}
          hookProps={{
            path: `${API}/clinic/profile`,
            method: "POST",
            successCb: () => {
              mutate();
            },
          }}
          renderer={{
            name: { type: "text", title: getContent("name") },
            image: { type: "image", title: getContent("image") },
            description: { type: "area", title: getContent("description") },
            summary: { type: "area", title: getContent("summary") },
            category: {
              type: "nodes",
              title: getContent("category"),
              path: `${API}/public/clinicCategory`,
              getOptionLabel: (node) =>
                (node as IClinicCategory).name || (node as IClinicCategory)._id,
              getOptionValue: (node) => (node as IClinicCategory)._id,
              getDefaultValue: (inp) => inp.category,
              multi: false,
            },
            tags: {
              type: "nodes",
              title: getContent("tags"),
              path: `${API}/public/selectclinictag`,
              getOptionLabel: (node) =>
                (node as IClinicTag).name || (node as IClinicTag)._id,
              getOptionValue: (node) => (node as IClinicTag)._id,
              getDefaultValue: (inp) => inp.tags,
              multi: true,
            },
            establishment: { type: "text", title: getContent("establishment") },
            businessTimes: { type: "text", title: getContent("businessTime") },
            phone: { type: "text", title: getContent("phone") },
            mail: { type: "text", title: getContent("mail") },
            website: { type: "text", title: getContent("website") },
            isRoundTheClock: {
              type: "bool",
              title: getContent("roundTheClock"),
            },
            personelCount: { type: "number", title: getContent("personelCount") },
            services: { type: "strings", title: getContent("services") },
            certificates: { type: "strings", title: getContent("certificates") },
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

export default ClinicManageDetailsTab;
