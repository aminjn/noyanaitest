import { ITaminDrugUsage } from "@/Components/Admin/Tamin/DrugUsage/AdminManageTaminDrugUsagesPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import FancySelect from "@/Components/UI/FancySelect";
import { useContext } from "react";
import useSWR from "swr";
import PrescriptionContext from "../../../PrescriptionContext";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPrescriptionDrugItem"];

const UsageGetter = () => {
  const { data } = useSWR<ITaminDrugUsage[]>(
    `${API}/doctor/presc/usage`,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );

  const { setWorking, working } = useContext(PrescriptionContext);

  const getContent = useScopedLocale(LOCALE_NS);

  return (
    <FancySelect
      title={getContent("drugUsage")}
      placeholder={getContent("searchDrugUsage")}
      options={data?.map((el) => ({
        title: el.drugUsageConcept || "",
        value: el._id,
      }))}
      onChange={(e) =>
        setWorking((prev) => ({
          ...prev,
          usage: data?.find((el) => el._id === e),
        }))
      }
      defaultValue={working.usage?.drugUsageConcept}
    />
  );
};

export default UsageGetter;
