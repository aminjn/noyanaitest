import { useContext } from "react";
import PrescriptionContext from "../../../PrescriptionContext";
import useSWR from "swr";
import { API } from "@/Components/config";
import { ITaminDrugInstruction } from "@/Components/Admin/Tamin/DrugInstructions/AdminManageTaminDrugInstructionsPage";
import { fetcher } from "@/Components/helpers/fetcher";
import FancySelect from "@/Components/UI/FancySelect";
import useLocale from "@/Components/Hooks/useLocale";

const InstructionGetter = () => {
  const { setWorking, working } = useContext(PrescriptionContext);
  const { data } = useSWR<ITaminDrugInstruction[]>(
    `${API}/doctor/presc/instruction`,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );

  const getContent = useLocale();

  return (
    <FancySelect
      options={data?.map((node) => ({
        title: node.drugInstConcept || "",
        value: node._id,
      }))}
      title={getContent("drugInstruction")}
      placeholder={getContent("searchDrugInstruction")}
      onChange={(e) =>
        setWorking((prev) => ({
          ...prev,
          instruction: data?.find((el) => el._id === e),
        }))
      }
      defaultValue={working.instruction?.drugInstConcept}
    />
  );
};

export default InstructionGetter;
