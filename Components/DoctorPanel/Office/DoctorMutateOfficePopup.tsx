import PopupCard from "@/Components/UI/PopupCard";
import { IOffice } from "./DoctorManageOfficesPage";
import classes from "./DoctorMutateOfficePopup.module.css";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import useLocale from "@/Components/Hooks/useLocale";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";

const DoctorMutateOfficePopup = ({ mutate }: { mutate: () => unknown }) => {
  const getContent = useLocale();

  const { closePopup } = usePopup();

  return (
    <PopupCard>
      <CreateForm<IOffice>
        renderer={{
          name: { type: "text", title: getContent("name") },
          active: { title: getContent("isActive"), type: "bool" },
          order: { title: getContent("order"), type: "number" },
          tel: { title: getContent("telephone"), type: "text" },
        }}
        hookProps={{
          method: "POST",
          path: `${API}/doctor/office`,
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        onCancel={() => closePopup()}
      />
    </PopupCard>
  );
};

export default DoctorMutateOfficePopup;
