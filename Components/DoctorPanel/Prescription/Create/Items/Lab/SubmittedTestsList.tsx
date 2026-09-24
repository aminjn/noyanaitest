import { MongoDoc } from "@/Components/Hooks/useUser";
import PrescriptionContext, { LabItem } from "../../../PrescriptionContext";
import classes from "./SubmittedTestsList.module.css";
import ListOfItems from "../../../ListOfItems";
import PreviewPrescriptionItem from "../../../PreviewPrescriptionItem";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { dateToString } from "@/Components/UI/FormatDate";
import { useContext } from "react";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPrescriptionEditor"];

const SubmittedTestsList = ({
  nodes,
  readOnly,
}: {
  readOnly?: boolean;
  nodes: (LabItem & MongoDoc)[];
}) => {
  const getCompContent = useScopedLocale(LOCALE_NS);

  const getContent = useScopedLocale(LOCALE_NS);

  const { setWorkingLab, setLabItems } = useContext(PrescriptionContext);

  return (
    <ListOfItems>
      {nodes.map((node) => (
        <PreviewPrescriptionItem
          key={node._id}
          name={node.item.srvName || ""}
          description={`${getCompContent("xUnit", [node.qty.toString()])}/${node.dateDo ? dateToString({ value: node.dateDo, time: false }) : ""}`}
          onEdit={readOnly ? undefined : () => setWorkingLab(node)}
          onDelete={
            readOnly
              ? undefined
              : () =>
                  setLabItems((prev) => {
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
          pairs={[
            { title: getContent("testCount"), value: node.qty.toString() },
            {
              title: getContent("testDoDate"),
              value: node.dateDo
                ? dateToString({ value: node.dateDo, time: false })
                : getContent("notAssigned"),
            },
            { title: getContent("description"), value: node.description || "" },
          ]}
        />
      ))}
    </ListOfItems>
  );
};

export default SubmittedTestsList;
