import {
  categorizedDoctorSecretaryActions,
  doctorSecretaryActionCategories,
  IDoctorSecretaryAccessLevel,
} from "@/Components/Admin/DoctorSecretaryAccessLevel/AdminManageDoctorSecretaryAccessLevelsPage";
import classes from "./MutateDoctorSecretaryAccessLevelPopup.module.css";
import useForm from "@/Components/Hooks/useForm";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import useLocale from "@/Components/Hooks/useLocale";
import Input from "@/Components/UI/Input";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import ToggleInput from "@/Components/UI/ToggleInput";
import FormActions from "@/Components/Admin/UI/FormActions";
import Button from "@/Components/UI/Button";
import TableBox from "@/Components/UI/TableBox";

const MutateDoctorSecretaryAccessLevelPopup = ({
  mutate,
  node,
}: {
  node?: IDoctorSecretaryAccessLevel;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  const { isLoading, setInput, submit, input } =
    useForm<IDoctorSecretaryAccessLevel>({
      path: `${API}/doctor/accesslevel${!!node ? `/${node._id}` : ""}`,
      method: "POST",
      successCb: () => {
        mutate();
        closePopup();
      },
    });

  const getContent = useLocale();

  return (
    <PopupCard>
      <TableBox
        className={classes.main}
        title={getContent(!!node ? "editAccessLevel" : "createAccessLevel")}
      >
        <Input
          title={getContent("name")}
          onChange={(e) =>
            setInput((prev) => ({ ...prev, name: e.target.value }))
          }
          readOnly={isLoading}
          defaultValue={node?.name}
        />
        <ClientTabSystem
          items={doctorSecretaryActionCategories.map((category) => ({
            id: category,
            title: getContent(category),
            content: (
              <div className={classes.list}>
                {categorizedDoctorSecretaryActions[category].map((action) => (
                  <ToggleInput
                    title={getContent(action)}
                    key={action}
                    readOnly={isLoading}
                    value={
                      input[action] === undefined
                        ? !!node?.[action]
                        : !!input[action]
                    }
                    onChange={() =>
                      setInput((prev) => ({
                        ...prev,
                        [action]:
                          prev[action] === undefined
                            ? !node?.[action]
                            : !prev[action],
                      }))
                    }
                  />
                ))}
              </div>
            ),
          }))}
        />
        <FormActions className={classes.actions}>
          <Button onClick={submit}>{getContent("submit")}</Button>
          <Button variant="Danger" onClick={() => closePopup()}>
            {getContent("cancel")}
          </Button>
        </FormActions>
      </TableBox>
    </PopupCard>
  );
};

export default MutateDoctorSecretaryAccessLevelPopup;
