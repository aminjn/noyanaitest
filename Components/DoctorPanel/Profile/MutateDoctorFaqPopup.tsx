import usePopup from "@/Components/Hooks/usePopup";
import { IDoctorFaq } from "./DoctorManageFaqTab";
import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import useLocale from "@/Components/Hooks/useLocale";
import { API } from "@/Components/config";

const MutateDoctorFaqPopup = ({
  mutate,
  node,
}: {
  node?: IDoctorFaq;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();
  const getContent = useLocale();
  return (
    <PopupCard>
      <CreateForm
        style={{ width: "min(40rem , 90dvw)" }}
        defaultValue={node}
        renderer={{
          question: { title: getContent("question"), type: "text" },
          answer: { title: getContent("answer"), type: "text" },
          active: { title: getContent("isActive"), type: "bool" },
          order: { title: getContent("order"), type: "number" },
        }}
        onCancel={() => {
          closePopup();
        }}
        hookProps={{
          path: `${API}/doctor/faq${node ? `/${node._id}` : ""}`,
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

export default MutateDoctorFaqPopup;
