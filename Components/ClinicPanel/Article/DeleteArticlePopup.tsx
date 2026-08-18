import { Fragment, useState } from "react";
import { IArticle } from "./ClinicManageArticlesPage";
import usePopup from "@/Components/Hooks/usePopup";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import useLocale from "@/Components/Hooks/useLocale";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";

const DeleteArticlePopup = ({
  mutate,
  node,
}: {
  node: IArticle;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();

  const getContent = useLocale();

  return (
    <Fragment>
      <ConfirmationPopup
        message={getContent("sureDeleteArticle")}
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/blog/clinic/${node._id}` : null}
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

export default DeleteArticlePopup;
