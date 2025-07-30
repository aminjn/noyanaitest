import { Fragment, useState } from "react";
import Loading from "../UI/Loading";
import classes from "./CreateAccessLevelPopup.module.css";
import Act from "@/Components/UI/Act";
import usePopup from "@/Components/Hooks/usePopup";
import { IAccessLevel } from "./AdminManageAccessLevelsPage";
import { API } from "@/Components/config";
import useProgress from "@/Components/Hooks/useProgress";
import { adminPath } from "@/Components/helpers/adminPath";

const CreateAccessLevelPopup = ({ mutate }: { mutate: () => unknown }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { closePopup } = usePopup();

  const push = useProgress();

  return (
    <Fragment>
      <Loading />
      <Act<{ data: { data: IAccessLevel } }>
        path={isLoading ? `${API}/auto/accesslevel` : null}
        method="POST"
        onDone={(status, result) => {
          setIsLoading(false);
          if (status) {
            mutate();
            if (result) push(adminPath(`/accesslevel/${result.data.data._id}`));
          }
          closePopup();
        }}
      />
    </Fragment>
  );
};

export default CreateAccessLevelPopup;
