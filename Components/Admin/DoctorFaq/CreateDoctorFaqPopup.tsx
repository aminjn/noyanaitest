import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../UI/CreateForm";
import { IDoctorFaq } from "@/Components/DoctorPanel/Profile/DoctorManageFaqTab";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";

const CreateFaqPopup = ({ mutate }: { mutate: () => unknown }) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard>
      <CreateForm<IDoctorFaq>
        onCancel={() => closePopup()}
        renderer={{
          question: { type: "text", title: "سوال" },
          answer: { type: "text", title: "جواب" },
          order: { type: "number", title: "رتبه" },
          active: { type: "bool", title: "فعال" },
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
