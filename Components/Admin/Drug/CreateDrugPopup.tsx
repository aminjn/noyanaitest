import usePopup from "@/Components/Hooks/usePopup";
import { Fragment, useState } from "react";
import Loading from "../UI/Loading";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import { IDrug } from "../Disease/AdminManageDiseasesPage";
import useProgress from "@/Components/Hooks/useProgress";
import { adminPath } from "@/Components/helpers/adminPath";

const CreateDrugPopup = ({ mutate }: { mutate: () => unknown }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { closePopup } = usePopup();

  const push = useProgress();

  return (
    <Fragment>
      <Loading />
      <Act<{ data: { data: IDrug } }>
        path={isLoading ? `${API}/auto/drug` : null}
        method="POST"
        onDone={(status, result) => {
          setIsLoading(false);
          if (!status) return;
          mutate();
          if (result) push(adminPath(`/drug/${result.data.data._id}`));
          closePopup();
        }}
      />
    </Fragment>
  );
};

export default CreateDrugPopup;
