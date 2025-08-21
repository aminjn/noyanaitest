import {
  categorizedDoctorSecretaryActions,
  doctorSecretaryActionCategories,
  IDoctorSecretaryAccessLevel,
} from "@/Components/Admin/DoctorSecretaryAccessLevel/AdminManageDoctorSecretaryAccessLevelsPage";
import classes from "./PreviewDoctorSecretaryAccessLevelPopup.module.css";
import TableBox from "@/Components/UI/TableBox";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import useLocale from "@/Components/Hooks/useLocale";
import BooleanToIcon from "@/Components/UI/BooleanToIcon";
import FormActions from "@/Components/Admin/UI/FormActions";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import List from "@/Components/Admin/UI/List";

const PreviewDoctorSecretaryAccessLevelPopup = ({
  node,
}: {
  node: IDoctorSecretaryAccessLevel;
}) => {
  const getContent = useLocale();

  const { closePopup } = usePopup();

  return (
    <PopupCard>
      <TableBox
        className={classes.main}
        title={node.name || getContent("accessLevel")}
      >
        <ClientTabSystem
          items={doctorSecretaryActionCategories.map((category) => ({
            id: category,
            title: getContent(category),
            content: (
              <List>
                {categorizedDoctorSecretaryActions[category].map((action) => (
                  <div key={action} className={classes.item}>
                    <BooleanToIcon value={!!node[action]} />
                    <legend>{getContent(action)}</legend>
                  </div>
                ))}
              </List>
            ),
          }))}
        />
        <FormActions className={classes.actions}>
          <Button onClick={() => closePopup()}>{getContent("close")}</Button>
        </FormActions>
      </TableBox>
    </PopupCard>
  );
};

export default PreviewDoctorSecretaryAccessLevelPopup;
