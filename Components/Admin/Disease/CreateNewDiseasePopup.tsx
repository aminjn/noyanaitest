import { Fragment, useState } from "react";
import Loading from "../UI/Loading";
import Act from "@/Components/UI/Act";
import useProgress from "@/Components/Hooks/useProgress";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";
import { IDisease } from "./AdminManageDiseasesPage";
import { adminPath } from "@/Components/helpers/adminPath";

const CreateNewDiseasePopup = ({ mutate }: { mutate: () => unknown }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const push = useProgress();
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <Loading />
      <Act<{ data: { data: IDisease } }>
        path={isLoading ? `${API}/auto/disease` : null}
        method="POST"
        onDone={(status, result) => {
          setIsLoading(false);
          if (!status) return;
          mutate();
          if (result) push(adminPath(`/disease/${result.data.data._id}`));
          closePopup();
        }}
      />
    </Fragment>
  );
};

export default CreateNewDiseasePopup;
