import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";
import { Fragment, useState } from "react";
import Loading from "../UI/Loading";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import { ISymptom } from "../Disease/AdminManageDiseasesPage";
import { adminPath } from "@/Components/helpers/adminPath";

const CreateSymptomPopup = ({ mutate }: { mutate: () => unknown }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const push = useProgress();
  const { closePopup } = usePopup();

  return (
    <Fragment>
      <Loading />
      <Act<{ data: { data: ISymptom } }>
        path={isLoading ? `${API}/auto/symptom` : null}
        method="POST"
        onDone={(status, result) => {
          setIsLoading(false);
          if (!status) return;
          mutate();
          if (result) push(adminPath(`/symptom/${result.data.data._id}`));
          closePopup();
        }}
      />
    </Fragment>
  );
};

export default CreateSymptomPopup;
