import {
  categorizedDoctorSecretaryActions,
  doctorSecretaryActionCategories,
} from "@/Components/Admin/DoctorSecretaryAccessLevel/AdminManageDoctorSecretaryAccessLevelsPage";
import classes from "./MutateSecretaryAccessLevelPopup.module.css";
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
import { ContentKey } from "@/Components/Enums/contentKeys";
import { Acl, NodeWithAcl } from "../Request/CreateSecretaryRequestPopup";

export const categoriesAclMap: Record<NodeWithAcl, readonly ContentKey[]> = {
  doctor: doctorSecretaryActionCategories,
  clinic: [],
  insurance: [],
  pharmacy: [],
};

export const categorizedAclMap: Record<
  NodeWithAcl,
  Readonly<Record<string, readonly ContentKey[]>>
> = {
  doctor: categorizedDoctorSecretaryActions,
  clinic: {},
  insurance: {},
  pharmacy: {},
};

const MutateSecretaryAccessLevelPopup = ({
  mutate,
  node,
  name,
}: {
  node?: Acl<string[], unknown>;
  mutate: () => unknown;
  name: NodeWithAcl;
}) => {
  const { closePopup } = usePopup();

  const { isLoading, setInput, submit, input } = useForm<
    Record<string, unknown>
  >({
    path: `${API}/acl/${name}/acl${!!node ? `/${node._id}` : ""}`,
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
          items={categoriesAclMap[name].map((category) => ({
            id: category,
            title: getContent(category),
            content: (
              <div className={classes.list}>
                {categorizedAclMap[name][category].map((action) => (
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
          <Button variant="Error" onClick={() => closePopup()}>
            {getContent("cancel")}
          </Button>
        </FormActions>
      </TableBox>
    </PopupCard>
  );
};

export default MutateSecretaryAccessLevelPopup;
