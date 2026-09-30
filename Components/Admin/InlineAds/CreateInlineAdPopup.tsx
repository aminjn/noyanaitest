import PopupCard from "@/Components/UI/PopupCard";
import usePopup from "@/Components/Hooks/usePopup";
import CreateForm from "../UI/CreateForm";
import { API } from "@/Components/config";

const CreateInlineAdPopup = ({ mutate }: { mutate: () => unknown }) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard title="تبلیغ خطی جدید">
      <CreateForm
        renderer={{ name: { type: "text", title: "نام" } }}
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
