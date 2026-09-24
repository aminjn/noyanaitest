import CreateForm from "@/Components/Admin/UI/CreateForm";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import PopupCard from "@/Components/UI/PopupCard";
import classes from "./NewInsuranceAdditionRequestPopup.module.css";
import { IInsuranceAdditionRequest } from "./DoctorInsuranceAdditionRequestsTab";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelInsurance"];

const NewInsuranceAdditionRequestPopup = ({
  mutate,
}: {
  mutate: () => unknown;
}) => {
  const getContent = useScopedLocale(NS);
  const { closePopup } = usePopup();
  return (
    <PopupCard>
      <CreateForm<IInsuranceAdditionRequest>
        className={classes.main}
        hookProps={{
          path: `${API}/doctor/insuranceaddition`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        onCancel={() => closePopup()}
        renderer={{
          name: { type: "text", title: getContent("insuranceName") },
          description: { type: "area", title: getContent("description") },
        }}
      />
    </PopupCard>
  );
};

export default NewInsuranceAdditionRequestPopup;
