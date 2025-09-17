import { ICallRoom } from "@/Components/Dashboard/Call/DashboardManageCallsPage";
import usePopup from "@/Components/Hooks/usePopup";
import { Fragment, useState } from "react";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";

const DestroyCallPopup = ({
  mutate,
  node,
}: {
  node: ICallRoom;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
        message="آیا از اتمام این تماس مطمئنید؟"
      />
      <Act
        path={isLoading ? `${API}/auto/callroom/${node._id}` : null}
        method="PUT"
        onDone={(status) => {
          setIsLoading(false);
          if (!status) return;
          mutate();
          closePopup();
        }}
      />
    </Fragment>
  );
};

export default DestroyCallPopup;
