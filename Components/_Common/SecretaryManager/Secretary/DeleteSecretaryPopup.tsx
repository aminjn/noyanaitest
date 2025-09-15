import { Fragment, useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import useLocale from "@/Components/Hooks/useLocale";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import { MongoDoc } from "@/Components/Hooks/useUser";

const DeleteSecretaryPopup = ({
  mutate,
  node,
  name,
}: {
  node: MongoDoc;
  mutate: () => unknown;
  name: string;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();

  const getContent = useLocale();

  return (
    <Fragment>
      <ConfirmationPopup
        message={getContent("deleteSecretaryConfirmationMessage")}
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/${name}/secretary/${node._id}` : null}
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

export default DeleteSecretaryPopup;
