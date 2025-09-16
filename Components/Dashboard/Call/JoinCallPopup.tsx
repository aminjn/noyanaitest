import Loading from "@/Components/Admin/UI/Loading";
import { ICallRoom } from "./DashboardManageCallsPage";
import { Fragment, useState } from "react";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import useProgress from "@/Components/Hooks/useProgress";
import usePopup from "@/Components/Hooks/usePopup";

const JoinCallPopup = ({ room }: { room: ICallRoom }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const push = useProgress();

  const { closePopup } = usePopup();

  return (
    <Fragment>
      <Loading />
      <Act
        path={isLoading ? `${API}/call/${room._id}` : null}
        method="POST"
        onDone={(status) => {
          setIsLoading(false);
          if (status) {
            push(`/dashboard/call/${room._id}`);
          }
          closePopup();
        }}
      />
    </Fragment>
  );
};

export default JoinCallPopup;
