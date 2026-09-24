import { MongoDoc } from "@/Components/Hooks/useUser";
import PrescriptionContext, {
  LabItem,
  PrescriptionItem,
} from "../PrescriptionContext";
import classes from "./PrescriptionItemsList.module.css";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { Fragment, useContext, useState } from "react";
import {
  t2xsDemiBold,
  t2xsRegular,
  txsMedium,
} from "@/Components/UI/Typography";
import Ixon from "@/Components/UI/Ixon";
import EditAltIcon from "@/Components/Icons/EditAltIcon";
import TrashIcon from "@/Components/Icons/TrashIcon";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import PillIcon from "@/Components/Icons/PillIcon";
import ChevronIcon from "@/Components/Icons/ChevronIcon";
import ListOfItems from "../ListOfItems";
import SubmittedDrugsList from "./Items/Drug/SubmittedDrugsList";
import FlaskIcon from "@/Components/Icons/FlaskIcon";
import SubmittedTestsList from "./Items/Lab/SubmittedTestsList";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPrescriptionEditor"];

const PrescriptionItemsList = ({
  items,
  labItems,
  readOnly,
}: {
  items: (PrescriptionItem & MongoDoc)[];
  labItems: (LabItem & MongoDoc)[];
  readOnly?: boolean;
}) => {
  const getContent = useScopedLocale(LOCALE_NS);
  return (
    <ClientTabSystem
      items={[
        // {
        //   title: `${getContent("allItems")}(${items.length})`,
        //   id: "All",
        //   content: <ItemsList nodes={items} readOnly={readOnly} />,
        // },
        //TODO:calculate this when other categories are implemented and maybe create a map
        {
          title: `${getContent("drug")}(${items.length})`,
          content: <SubmittedDrugsList nodes={items} readOnly={readOnly} />,
          id: "Drug",
          icon: <PillIcon />,
        },
        {
          title: `${getContent("test")}(${labItems.length})`,
          content: <SubmittedTestsList nodes={labItems} readOnly={readOnly} />,
          id: "Test",
          icon: <FlaskIcon />,
        },
      ]}
    />
  );
};

export default PrescriptionItemsList;
