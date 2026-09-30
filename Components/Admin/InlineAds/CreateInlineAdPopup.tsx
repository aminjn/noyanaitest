import PopupCard from "@/Components/UI/PopupCard";
import usePopup from "@/Components/Hooks/usePopup";
import CreateForm from "../UI/CreateForm";
import { API } from "@/Components/config";
import { ta } from "@/Components/Admin/i18n/adminText";

const CreateInlineAdPopup = ({ mutate }: { mutate: () => unknown }) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard title={ta("تبلیغ خطی جدید")}>
      <CreateForm
        renderer={{ name: { type: "text", title: ta("نام") } }}
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/auto/inlinead`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        styleManaged
      />
    </PopupCard>
  );
};

export default CreateInlineAdPopup;
