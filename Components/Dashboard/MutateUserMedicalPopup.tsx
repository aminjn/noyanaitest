import classes from "./MutateUserMedicalPopup.module.css";
import CreateForm from "../Admin/UI/CreateForm";
import usePopup from "../Hooks/usePopup";
import PopupCard from "../UI/PopupCard";
import { bloodTypes, IMedicalDetail } from "./UserMedicalDetails";
import { API } from "../config";
import useLocale from "../Hooks/useLocale";

const MutateUserMedicalPopup = ({
  mutate,
  node,
}: {
  mutate: () => unknown;
  node: IMedicalDetail;
}) => {
  const { closePopup } = usePopup();

  const getContent = useLocale();

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
            type: "range",
            title: getContent("height"),
            min: 0,
            max: 300,
            step: 5,
            markCount: 10,
          },
          weight: {
            type: "range",
            title: getContent("weight"),
            min: 0,
            max: 300,
            step: 5,
            markCount: 10,
          },
        }}
        onCancel={() => closePopup()}
        className={classes.main}
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
