import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../UI/CreateForm";
import { IDoctorFaq } from "@/Components/DoctorPanel/Profile/DoctorManageFaqTab";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";
import { ta } from "@/Components/Admin/i18n/adminText";

const CreateFaqPopup = ({ mutate }: { mutate: () => unknown }) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard title={ta("سوال صفحه‌ی پزشکان جدید")}>
      <CreateForm<IDoctorFaq>
        onCancel={() => closePopup()}
        renderer={{
          question: { type: "text", title: ta("سوال") },
          answer: { type: "text", title: ta("جواب") },
          order: { type: "number", title: ta("رتبه") },
          active: { type: "bool", title: ta("فعال") },
        }}
        hookProps={{
          path: `${API}/auto/doctorfaq`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
      />
    </PopupCard>
  );
};

export default CreateFaqPopup;
