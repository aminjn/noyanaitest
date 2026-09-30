import PopupCard from "@/Components/UI/PopupCard";
import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import classes from "./NewBlogCategoryPopup.module.css";
import usePopup from "@/Components/Hooks/usePopup";
import { blogCategoryFormRenderer } from "./AdminManageBlogCategoryPage";
import { ta } from "@/Components/Admin/i18n/adminText";

const NewBlogCategoryPopup = ({ mutate }: { mutate: () => unknown }) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard title={ta("دسته‌بندی جدید مقاله")}>
      <CreateForm
        className={classes.main}
        renderer={blogCategoryFormRenderer}
        hookProps={{
          path: `${API}/auto/blogcategory`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        onCancel={closePopup}
      />
    </PopupCard>
  );
};

export default NewBlogCategoryPopup;
