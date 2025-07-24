import { Fragment, useState } from "react";
import ConfirmationPopup from "../Admin/UI/ConfirmationPopup";
import { IBlogMedia } from "./AdminManageBlogMediasPage";
import classes from "./DeleteBlogMediaPopup.module.css";
import Act from "../UI/Act";
import { API } from "../config";
import usePopup from "../Hooks/usePopup";

const DeleteBlogMediaPopup = ({
  mutate,
  node,
}: {
  node: IBlogMedia;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { closePopup } = usePopup();

  return (
    <Fragment>
      <ConfirmationPopup
        message={`آیا از حذف ${node.name} مطمئنید؟`}
        onConfirm={() => setIsLoading(true)}
        isLoading={isLoading}
      />
      <Act
        path={isLoading ? `${API}/auto/blogmedia/${node._id}` : null}
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

export default DeleteBlogMediaPopup;
