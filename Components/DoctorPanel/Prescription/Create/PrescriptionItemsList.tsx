import { MongoDoc } from "@/Components/Hooks/useUser";
import PrescriptionContext, { PrescriptionItem } from "../PrescriptionContext";
import classes from "./PrescriptionItemsList.module.css";
import useComplexLocale from "@/Components/Hooks/useComplexLocale";
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
import useLocale from "@/Components/Hooks/useLocale";
import PillIcon from "@/Components/Icons/PillIcon";
import ChevronIcon from "@/Components/Icons/ChevronIcon";

const Pair = ({ title, value }: { title: string; value: string }) => {
  return (
    <div className={classes.pair}>
      <span className={`${classes.pairTitle} ${t2xsRegular}`}>{title}</span>
      <span className={`${classes.pairValue} ${txsMedium}`}>{value}</span>
    </div>
  );
};

const ItemsList = ({
  nodes,
  readOnly,
}: {
  nodes: (PrescriptionItem & MongoDoc)[];
  readOnly?: boolean;
}) => {
  const getCompContent = useComplexLocale();

  const getContent = useLocale();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { setItems, setWorking } = useContext(PrescriptionContext);

  return (
    <div className={classes.list}>
      {nodes.map((node) => (
        <div key={`${node._id}`} className={classes.itemWrapper}>
          <div className={classes.item}>
            <div className={classes.itemContent}>
              <span className={`${txsMedium} ${classes.itemName}`}>
                {node.item.srvName}
              </span>
              <span
                style={{ opacity: isOpen ? 0 : 1 }}
                className={`${t2xsDemiBold} ${classes.itemDescription}`}
              >{`${getCompContent("xUnit", [node.qty.toString()])}/${
                node.usage.drugUsageConcept
              }/${node.instruction.drugInstConcept}/${
                node.amount.drugAmntConcept
              }`}</span>
            </div>
            <div className={classes.itemActions}>
              {!readOnly && (
                <Fragment>
                  <button
                    type="button"
                    onClick={() => {
                      setWorking(node);
                    }}
                    className={classes.action}
                  >
                    <Ixon width="1.125rem">
                      <EditAltIcon />
                    </Ixon>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setItems((prev) => {
                        const clone = [...prev];
                        const index = clone.findIndex(
                          (n) => n._id === node._id
                        );
                        if (index === -1) {
                          return prev;
                        } else {
                          clone.splice(index, 1);
                        }
                        return clone;
                      })
                    }
                    className={classes.action}
                  >
                    <Ixon width="1.125rem">
                      <TrashIcon />
                    </Ixon>
                  </button>
                </Fragment>
              )}
              <button
                type="button"
                className={classes.action}
                onClick={() => setIsOpen((prev) => !prev)}
                style={{ transform: `rotateZ(${isOpen ? 180 : 0}deg)` }}
              >
                <Ixon width="1.125rem">
                  <ChevronIcon />
                </Ixon>
              </button>
            </div>
          </div>
          <div className={`${classes.expansion} ${isOpen ? classes.open : ""}`}>
            <Pair title={getContent("drugCount")} value={node.qty.toString()} />
            <Pair
              title={getContent("drugUsage")}
              value={node.usage.drugUsageConcept || ""}
            />
            <Pair
              title={getContent("drugInstruction")}
              value={node.instruction.drugInstConcept || ""}
            />
            <Pair
              title={getContent("drugAmount")}
              value={node.amount.drugAmntConcept || ""}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const PrescriptionItemsList = ({
  items,
  readOnly,
}: {
  items: (PrescriptionItem & MongoDoc)[];
  readOnly?: boolean;
}) => {
  const getContent = useLocale();
  return (
    <ClientTabSystem
      items={[
        {
          title: `${getContent("allItems")}(${items.length})`,
          id: "All",
          content: <ItemsList nodes={items} readOnly={readOnly} />,
        },
        //TODO:calculate this when other categories are implemented and maybe create a map
        {
          title: `${getContent("drug")}(${items.length})`,
          content: <ItemsList nodes={items} readOnly={readOnly} />,
          id: "Drug",
          icon: <PillIcon />,
        },
      ]}
    />
  );
};

export default PrescriptionItemsList;
