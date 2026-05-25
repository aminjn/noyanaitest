import Form from "@/Components/UI/Form";
import List from "../UI/List";
import classes from "./ClinicUserTab.module.css";
import FormActions from "../UI/FormActions";
import CreateForm from "../UI/CreateForm";
import { IClinic } from "./AdminManageClinicsPage";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import RemoveUserFromClinicPopup from "./RemoveUserFromClinicPopup";
import { getUserLabel } from "../Lib/LabelGetters";
import { IUser } from "@/Components/Hooks/useUser";
import { API } from "@/Components/config";

const ClinicUserTab = ({
  mutate,
  node,
}: {
  node: IClinic<{ User: true }>;
  mutate: () => unknown;
}) => {
  const { setPopup } = usePopup();

  return (
    <div>
      <CreateForm
        defaultValue={node}
        renderer={{
          user: {
            title: "یوزر",
            type: "nodes",
            getOptionLabel: (node) => getUserLabel(node as IUser),
            path: `${API}/auto/user`,
            getOptionValue: (node) => (node as IUser)._id,
            getDefaultValue: (node) => node.user?._id,
          },
        }}
        hookProps={{
          path: `${API}/auto/clinic/${node._id}`,
          method: "POST",
          successCb: () => mutate(),
        }}
      />
      <FormActions>
        {node.user && (
          <Button
            onClick={() =>
              setPopup(
                "RemoveUserFromClinic",
                <RemoveUserFromClinicPopup node={node} mutate={mutate} />,
              )
            }
            variant="Error"
          >
            حذف یوزر از روی این کلینیک
          </Button>
        )}
      </FormActions>
    </div>
  );
};

export default ClinicUserTab;
