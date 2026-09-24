import classes from "./SubmittedDrugsList.module.css";
import PrescriptionContext, {
  PrescriptionItem,
} from "../../../PrescriptionContext";
import { MongoDoc } from "@/Components/Hooks/useUser";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { useContext } from "react";
import ListOfItems from "../../../ListOfItems";
import PreviewPrescriptionItem from "../../../PreviewPrescriptionItem";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPrescriptionDrugItem"];

const SubmittedDrugsList = ({
  nodes,
  readOnly,
}: {
  nodes: (PrescriptionItem & MongoDoc)[];
  readOnly?: boolean;
}) => {
  const getCompContent = useScopedLocale(LOCALE_NS);

  const getContent = useScopedLocale(LOCALE_NS);

  const { setItems, setWorking } = useContext(PrescriptionContext);

  return (
    <ListOfItems>
      {nodes.map((node) => (
        <PreviewPrescriptionItem
          key={node._id}
          name={node.item.srvName || ""}
          description={`${getCompContent("xUnit", [node.qty.toString()])}/${
            node.usage.drugUsageConcept
          }/${node.instruction.drugInstConcept}/${node.amount.drugAmntConcept}`}
          onDelete={
            readOnly
              ? undefined
              : () =>
                  setItems((prev) => {
                    const clone = [...prev];
                    const index = clone.findIndex((n) => n._id === node._id);
                    if (index === -1) {
                      return prev;
                    } else {
                      clone.splice(index, 1);
                    }
                    return clone;
                  })
          }
          onEdit={
            readOnly
              ? undefined
              : () => {
                  setWorking(node);
                }
          }
          pairs={[
            { title: getContent("drugCount"), value: node.qty.toString() },
            {
              title: getContent("drugUsage"),
              value: node.usage.drugUsageConcept || "",
            },
            {
              title: getContent("drugInstruction"),
              value: node.instruction.drugInstConcept || "",
            },
            {
              title: getContent("drugAmount"),
              value: node.amount.drugAmntConcept || "",
            },
          ]}
        />
      ))}
    </ListOfItems>
  );
};

export default SubmittedDrugsList;
