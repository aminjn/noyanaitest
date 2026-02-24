import {
  t2xsDemiBold,
  t2xsRegular,
  txsMedium,
} from "@/Components/UI/Typography";
import classes from "./PreviewPrescriptionItem.module.css";
import { Fragment, useMemo, useState } from "react";
import Ixon from "@/Components/UI/Ixon";
import ChevronIcon from "@/Components/Icons/ChevronIcon";
import EditAltIcon from "@/Components/Icons/EditAltIcon";
import TrashIcon from "@/Components/Icons/TrashIcon";

const Pair = ({ title, value }: { title: string; value: string }) => {
  return (
    <div className={classes.pair}>
      <span className={`${classes.pairTitle} ${t2xsRegular}`}>{title}</span>
      <span className={`${classes.pairValue} ${txsMedium}`}>{value}</span>
    </div>
  );
};

const PreviewPrescriptionItem = ({
  name,
  description,
  onDelete,
  onEdit,
  pairs,
}: {
  name: string;
  description: string;
  onEdit?: () => unknown;
  onDelete?: () => unknown;
  pairs: { title: string; value: string }[];
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const readOnly = useMemo<boolean>(
    () => !onEdit && !onDelete,
    [onEdit, onDelete],
  );

  return (
    <div className={classes.itemWrapper}>
      <div className={classes.item}>
        <div className={classes.itemContent}>
          <span className={`${txsMedium} ${classes.itemName}`}>{name}</span>
          <span
            style={{ opacity: isOpen ? 0 : 1 }}
            className={`${t2xsDemiBold} ${classes.itemDescription}`}
          >
            {description}
          </span>
        </div>
        <div className={classes.itemActions}>
          {!readOnly && (
            <Fragment>
              {!!onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className={classes.action}
                >
                  <Ixon width="1.125rem">
                    <EditAltIcon />
                  </Ixon>
                </button>
              )}
              {!!onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className={classes.action}
                >
                  <Ixon width="1.125rem">
                    <TrashIcon />
                  </Ixon>
                </button>
              )}
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
        {pairs.map((pair) => (
          <Pair key={pair.title} title={pair.title} value={pair.value} />
        ))}
      </div>
    </div>
  );
};

export default PreviewPrescriptionItem;
