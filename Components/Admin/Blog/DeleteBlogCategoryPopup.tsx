import { Fragment, useState } from "react";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import classes from "./DeleteBlogCategoryPopup.module.css";
import Act from "@/Components/UI/Act";
import { IBlogCategory } from "./AdminManageBlogsPage";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import { ta } from "@/Components/Admin/i18n/adminText";

const DeleteBlogCategoryPopup = ({
  mutate,
  node,
}: {
  node: IBlogCategory;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { closePopup } = usePopup();

  return (
    <Fragment>
      <ConfirmationPopup
        message={ta("آیا از حذف دسته بندی ${1} مطمئنید؟", [node.title])}
        onConfirm={() => setIsLoading(true)}
        isLoading={isLoading}
      />
      <Act
        path={isLoading ? `${API}/auto/blogcategory/${node._id}` : null}
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

export default DeleteBlogCategoryPopup;
