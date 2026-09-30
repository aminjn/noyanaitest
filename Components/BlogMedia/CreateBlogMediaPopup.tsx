import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../Admin/UI/CreateForm";
import { API } from "../config";
import usePopup from "../Hooks/usePopup";

const CreateBlogMediaPopup = ({ mutate }: { mutate: () => unknown }) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard title="رسانه‌ی جدید">
      <CreateForm
        hookProps={{
          method: "POST",
          path: `${API}/auto/blogmedia`,
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        renderer={{ name: { title: "نام", type: "text" } }}
        onCancel={() => closePopup()}
      />
    </PopupCard>
  );
};

export default CreateBlogMediaPopup;
