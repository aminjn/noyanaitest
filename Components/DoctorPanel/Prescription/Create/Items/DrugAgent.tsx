import classes from "./DrugAgent.module.css";
import DrugGetter from "./Drug/DrugGetter";
import CountGetter from "./Drug/CountGetter";
import InstructionGetter from "./Drug/InstructionGetter";
import AmountGetter from "./Drug/AmountGetter";
import UsageGetter from "./Drug/UsageGetter";
import AreaInput from "@/Components/UI/AreaInput";
import DrugSubmitter from "./Drug/DrugSubmitter";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { useContext } from "react";
import PrescriptionContext from "../../PrescriptionContext";
import Button from "@/Components/UI/Button";
import { nanoid } from "nanoid";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPrescriptionEditor"];

const DrugAgent = () => {
  const getContent = useScopedLocale(LOCALE_NS);

  const { setWorking, working } = useContext(PrescriptionContext);

  return (
    <div key={working._id} className={classes.main}>
      <DrugGetter />
      <div className={classes.fields}>
        <CountGetter />
        <InstructionGetter />
        <AmountGetter />
        <UsageGetter />
      </div>
      <AreaInput
        title={getContent("description")}
        onChange={(e) =>
          setWorking((prev) => ({ ...prev, description: e.target.value }))
        }
        defaultValue={working.description}
      />
      <div className={classes.actions}>
        <Button
          onClick={() =>
            setWorking({ _id: `${nanoid()}${new Date().getTime()}` })
          }
        >
          {getContent("startAgain")}
        </Button>
        <DrugSubmitter />
      </div>
    </div>
  );
};

export default DrugAgent;
