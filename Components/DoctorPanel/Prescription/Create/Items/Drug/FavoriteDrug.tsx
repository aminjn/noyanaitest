import Ixon from "@/Components/UI/Ixon";
import classes from "./FavoriteDrug.module.css";
import StarIcon from "@/Components/Icons/StarIcon";
import { Fragment, useContext, useState } from "react";
import PrescriptionContext, {
  PrescriptionItem,
} from "../../../PrescriptionContext";
import { isWorkingReady } from "./DrugSubmitter";
import useLocale from "@/Components/Hooks/useLocale";
import useNotification from "@/Components/Hooks/useNotification";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";

const FavoriteDrug = ({ mutate }: { mutate: () => unknown }) => {
  const { working } = useContext(PrescriptionContext);

  const [loading, setLoading] = useState<Partial<
    Record<keyof PrescriptionItem, string>
  > | null>(null);

  const getContent = useLocale();

  const pushNotification = useNotification();

  return (
    <Fragment>
      <button
        className={classes.fav}
        onClick={() => {
          if (!!loading) return;
          if (!isWorkingReady(working))
            return pushNotification(getContent("checkInput"), "Warn");
          setLoading({
            item: working.item?._id,
            amount: working.amount?._id,
            description: working.description,
            instruction: working.instruction?._id,
            qty: working.qty?.toString(),
            usage: working.usage?._id,
          });
        }}
      >
        <Ixon width="1.5rem">
          <StarIcon />
        </Ixon>
      </button>
      <Act
        method="PUT"
        path={loading ? `${API}/doctor/presc/drug` : null}
        payload={loading || undefined}
        onDone={(status) => {
          setLoading(null);
          if (!status) return;
          mutate();
        }}
        successMessage={getContent("drugFavorited")}
      />
    </Fragment>
  );
};

export default FavoriteDrug;
