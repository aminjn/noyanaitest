import { ITaminDrugAmount } from "@/Components/Admin/Tamin/DrugAmount/AdminManageTaminDrugAmountsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useLocale from "@/Components/Hooks/useLocale";
import FancySelect from "@/Components/UI/FancySelect";
import { useContext } from "react";
import useSWR from "swr";
import PrescriptionContext from "../../../PrescriptionContext";
import usePrescription from "@/Components/DoctorPanel/Prescription2/Store/usePrescription";

const AmountGetter = () => {
  const { data } = useSWR<ITaminDrugAmount[]>(
    `${API}/doctor/presc/amount`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const { setWorking, working } = usePrescription();

  const getContent = useLocale();

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
