import { useContext } from "react";
import PrescriptionContext from "../../../PrescriptionContext";
import useSWR from "swr";
import { API } from "@/Components/config";
import { ITaminDrugInstruction } from "@/Components/Admin/Tamin/DrugInstructions/AdminManageTaminDrugInstructionsPage";
import { fetcher } from "@/Components/helpers/fetcher";
import FancySelect from "@/Components/UI/FancySelect";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import usePrescription from "@/Components/DoctorPanel/Prescription2/Store/usePrescription";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPrescriptionDrugItem"];

const InstructionGetter = () => {
  const { setWorking, working } = usePrescription();
  const { data } = useSWR<ITaminDrugInstruction[]>(
    `${API}/doctor/presc/instruction`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const getContent = useScopedLocale(LOCALE_NS);

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
          drugInstruction: data?.find((el) => el._id === e),
        }))
      }
      defaultValue={working.drugInstruction?.drugInstConcept}
    />
  );
};

export default InstructionGetter;
