import useProgress from "@/Components/Hooks/useProgress";
import { Fragment, useState } from "react";
import Loading from "../UI/Loading";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import { IPart } from "../Disease/AdminManageDiseasesPage";
import { adminPath } from "@/Components/helpers/adminPath";

const CreatePartPopup = ({ mutate }: { mutate: () => unknown }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const push = useProgress();

  const { closePopup } = usePopup();

  return (
    <Fragment>
      <Loading />
      <Act<{ data: { data: IPart } }>
        path={isLoading ? `${API}/auto/part` : null}
        method="POST"
        onDone={(status, result) => {
          setIsLoading(false);
          if (!status) return;
          mutate();
          if (result) push(adminPath(`/part/${result.data.data._id}`));
          closePopup();
        }}
      />
    </Fragment>
  );
};

export default CreatePartPopup;
