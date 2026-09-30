import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../Admin/UI/CreateForm";
import { API } from "../config";
import usePopup from "../Hooks/usePopup";
import { IBlogMedia } from "./AdminManageBlogMediasPage";

const MutateBlogMediaPopup = ({
  mutate,
  defaultValue,
}: {
  defaultValue?: IBlogMedia;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard title="رسانه‌ی مقاله">
      <CreateForm
        onCancel={() => closePopup("MutateBlogMedia")}
        hookProps={{
          path: `${API}/auto/blogmedia${
            defaultValue ? `/${defaultValue._id}` : ""
          }`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup("MutateBlogMedia");
          },
        }}
        renderer={{
          name: { type: "text", title: "نام" },
          file: { type: "image", title: "تصویر" },
        }}
        styleManaged
        defaultValue={defaultValue}
      />
    </PopupCard>
  );
};

export default MutateBlogMediaPopup;
