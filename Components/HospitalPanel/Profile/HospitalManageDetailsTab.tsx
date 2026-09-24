import CreateForm from "@/Components/Admin/UI/CreateForm";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import { API } from "@/Components/config";
import useHospital from "@/Components/Hooks/useHospital";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { IHospitalTag } from "@/Components/Admin/HospitalTag/AdminManageHospitalTagsPage";
import { IHospitalCategory } from "@/Components/Admin/HospitalCategory/AdminManageHospitalCategoriesPage";
import { IInsurance } from "@/Components/DoctorPanel/Insurance/DoctorInsurancesTab";

const NS: ContentNamespace[] = ["common", "hospitalPanelProfile"];

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

export default HospitalManageDetailsTab;
