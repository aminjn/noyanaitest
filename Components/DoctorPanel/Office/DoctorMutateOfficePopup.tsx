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
        // the office and its place in one step (Doctolib / Paziresh24 ask
        // for the address on the map when the practice is added): the pin
        // fills the address, the doctor adds plaque / floor / unit by hand
        renderer={{
          name: { type: "text", title: getContent("name"), required: true, section: getContent("ofSecInfo") },
          tel: { title: getContent("telephone"), type: "text", section: getContent("ofSecInfo") },
          active: { title: getContent("isActive"), type: "bool", section: getContent("ofSecInfo") },
          ...(Object.fromEntries(
            Object.entries(centerFields).map(([k, v]) => [k, { ...v, section: getContent("ofSecInfo") }]),
          ) as typeof centerFields),
          location: {
            type: "point",
            title: getContent("ofMapPoint"),
            addressField: "address",
            store: "pair",
            section: getContent("ofSecLocation"),
          },
          address: { type: "area", title: getContent("ofAddressAuto"), section: getContent("ofSecLocation") },
          addressDetail: { type: "text", title: getContent("ofAddressDetail"), section: getContent("ofSecLocation") },
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
