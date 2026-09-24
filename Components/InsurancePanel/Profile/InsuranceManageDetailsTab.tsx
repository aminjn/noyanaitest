import CreateForm from "@/Components/Admin/UI/CreateForm";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import { API } from "@/Components/config";
import useInsurance from "@/Components/Hooks/useInsurance";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { IInsuranceTag } from "@/Components/Admin/InsuranceTag/AdminManageInsuranceTagsPage";
import { IInsuranceCategory } from "@/Components/Admin/InsuranceCategory/AdminManageInsuranceCategoriesPage";

const NS: ContentNamespace[] = ["common", "insurancePanelProfile"];

const InsuranceManageDetailsTab = () => {
  const { insurance, mutate } = useInsurance();

  const getContent = useScopedLocale(NS);

  return (
    <HandleLoading data={!!insurance}>
      {!!insurance && (
        <CreateForm
          style={{ width: "100%" }}
          defaultValue={insurance}
          hookProps={{
            path: `${API}/insurance/profile`,
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
              path: `${API}/public/insuranceCategory`,
              getOptionLabel: (node) =>
                (node as IInsuranceCategory).name ||
                (node as IInsuranceCategory)._id,
              getOptionValue: (node) => (node as IInsuranceCategory)._id,
              getDefaultValue: (inp) => inp.category,
              multi: false,
            },
            tags: {
              type: "nodes",
              title: getContent("tags"),
              path: `${API}/public/selectinsurancetag`,
              getOptionLabel: (node) =>
                (node as IInsuranceTag).name || (node as IInsuranceTag)._id,
              getOptionValue: (node) => (node as IInsuranceTag)._id,
              getDefaultValue: (inp) => inp.tags,
              multi: true,
            },
            establishment: { type: "text", title: getContent("establishment") },
            phone: { type: "text", title: getContent("phone") },
            website: { type: "text", title: getContent("website") },
            membersCount: { type: "text", title: getContent("membersCount") },
            centersCount: { type: "text", title: getContent("centersCount") },
            doctorsCount: { type: "text", title: getContent("doctorsCount") },
            pharmacyCount: { type: "text", title: getContent("pharmacyCount") },
            doctorCount: { type: "text", title: getContent("doctorCount") },
            hospitalCount: { type: "text", title: getContent("hospitalCount") },
            coverages: { type: "strings", title: getContent("coverages") },
            advantages: { type: "strings", title: getContent("advantages") },
            address: { type: "text", title: getContent("address") },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default InsuranceManageDetailsTab;
