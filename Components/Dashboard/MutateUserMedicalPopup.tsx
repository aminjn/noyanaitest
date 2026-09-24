import classes from "./MutateUserMedicalPopup.module.css";
import CreateForm from "../Admin/UI/CreateForm";
import usePopup from "../Hooks/usePopup";
import PopupCard from "../UI/PopupCard";
import { bloodTypes, IMedicalDetail } from "./UserMedicalDetails";
import { API } from "../config";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "dashboardMutateUserMedicalPopup"];

const MutateUserMedicalPopup = ({
  mutate,
  node,
}: {
  mutate: () => unknown;
  node: IMedicalDetail;
}) => {
  const { closePopup } = usePopup();

  const getContent = useScopedLocale(NS);

  return (
    <PopupCard>
      <CreateForm
        defaultValue={node}
        renderer={{
          bloodType: {
            type: "select",
            options: bloodTypes.reduce((acc, el) => ({ ...acc, [el]: el }), {}),
            title: getContent("bloodType"),
          },
          height: {
            type: "number",
            title: getContent("height"),
            // min: 0,
            // max: 300,
            // step: 5,
            // markCount: 10,
          },
          weight: {
            type: "number",
            title: getContent("weight"),
            // min: 0,
            // max: 300,
            // step: 5,
            // markCount: 10,
          },
        }}
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/user/medical`,
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

export default MutateUserMedicalPopup;
