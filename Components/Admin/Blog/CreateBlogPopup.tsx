import PopupCard from "@/Components/UI/PopupCard";
import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import classes from "./CreateBlogPopup.module.css";
import usePopup from "@/Components/Hooks/usePopup";
import { ta } from "@/Components/Admin/i18n/adminText";

const CreateBlogPopup = ({ mutate }: { mutate: () => unknown }) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard title={ta("مقاله‌ی جدید")}>
      <CreateForm
        hookProps={{
          path: `${API}/auto/blog`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        renderer={{ title: { type: "text", title: ta("عنوان") } }}
        onCancel={closePopup}
        className={classes.main}
      />
    </PopupCard>
  );
};

export default CreateBlogPopup;
