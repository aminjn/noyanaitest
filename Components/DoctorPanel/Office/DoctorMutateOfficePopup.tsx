import PopupCard from "@/Components/UI/PopupCard";
import { IOffice } from "./DoctorManageOfficesPage";
import classes from "./DoctorMutateOfficePopup.module.css";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import useOfficeCenterFields from "./useOfficeCenterFields";

const NS: ContentNamespace[] = ["common", "doctorPanelOffice"];

const DoctorMutateOfficePopup = ({ mutate }: { mutate: () => unknown }) => {
  const getContent = useScopedLocale(NS);
  const centerFields = useOfficeCenterFields();

  const { closePopup } = usePopup();

  return (
    <PopupCard title={getContent("officeNew")}>
      <CreateForm<IOffice>
        // new offices are active by default (the backend does the same)
        defaultValue={{ active: true } as IOffice}
        renderer={{
          name: { type: "text", title: getContent("name") },
          address: { type: "text", title: getContent("address") },
          active: { title: getContent("isActive"), type: "bool" },
          order: { title: getContent("order"), type: "number" },
          tel: { title: getContent("telephone"), type: "text" },
          ...centerFields,
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
