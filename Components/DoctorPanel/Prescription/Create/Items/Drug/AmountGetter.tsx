import { ITaminDrugAmount } from "@/Components/Admin/Tamin/DrugAmount/AdminManageTaminDrugAmountsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import FancySelect from "@/Components/UI/FancySelect";
import { useContext } from "react";
import useSWR from "swr";
import PrescriptionContext from "../../../PrescriptionContext";
import usePrescription from "@/Components/DoctorPanel/Prescription2/Store/usePrescription";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPrescriptionDrugItem"];

const AmountGetter = () => {
  const { data } = useSWR<ITaminDrugAmount[]>(
    `${API}/doctor/presc/amount`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const { setWorking, working } = usePrescription();

  const getContent = useScopedLocale(LOCALE_NS);

  return (
    <FancySelect
      title={getContent("drugAmount")}
      placeholder={getContent("searchDrugAmount")}
      options={data?.map((node) => ({
        title: node.drugAmntConcept || "",
        value: node._id,
      }))}
      onChange={(e) =>
        setWorking((prev) => ({
          ...prev,
          timesADay: data?.find((el) => el._id === e),
        }))
      }
      defaultValue={working.timesADay?.drugAmntConcept}
    />
  );
};

export default AmountGetter;
