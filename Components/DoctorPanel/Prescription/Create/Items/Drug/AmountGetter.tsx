import { ITaminDrugAmount } from "@/Components/Admin/Tamin/DrugAmount/AdminManageTaminDrugAmountsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useLocale from "@/Components/Hooks/useLocale";
import FancySelect from "@/Components/UI/FancySelect";
import { useContext } from "react";
import useSWR from "swr";
import PrescriptionContext from "../../../PrescriptionContext";

const AmountGetter = () => {
  const { data } = useSWR<ITaminDrugAmount[]>(
    `${API}/doctor/presc/amount`,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );

  const { setWorking, working } = useContext(PrescriptionContext);

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
          amount: data?.find((el) => el._id === e),
        }))
      }
      defaultValue={working.amount?.drugAmntConcept}
    />
  );
};

export default AmountGetter;
