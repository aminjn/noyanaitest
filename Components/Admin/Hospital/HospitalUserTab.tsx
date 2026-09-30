import Form from "@/Components/UI/Form";
import List from "../UI/List";
import classes from "./HospitalUserTab.module.css";
import FormActions from "../UI/FormActions";
import CreateForm from "../UI/CreateForm";
import { IHospital } from "./AdminManageHospitalsPage";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import RemoveUserFromHospitalPopup from "./RemoveUserFromHospitalPopup";
import { getUserLabel } from "../Lib/LabelGetters";
import { IUser } from "@/Components/Hooks/useUser";
import { API } from "@/Components/config";
import { ta } from "@/Components/Admin/i18n/adminText";

const HospitalUserTab = ({
  mutate,
  node,
}: {
  node: IHospital<{ User: Record<never, never> }>;
  mutate: () => unknown;
}) => {
  const { setPopup } = usePopup();

  return (
    <div>
      <CreateForm
        defaultValue={node}
        renderer={{
          user: {
            title: ta("کاربر"),
            type: "nodes",
            getOptionLabel: (node) => getUserLabel(node as IUser),
            path: `${API}/auto/user`,
            getOptionValue: (node) => (node as IUser)._id,
            getDefaultValue: (node) => node.user?._id,
          },
        }}
        hookProps={{
          path: `${API}/auto/hospital/${node._id}`,
          method: "POST",
          successCb: () => mutate(),
        }}
      />
      <FormActions>
        {node.user && (
          <Button
            onClick={() =>
              setPopup(
                "RemoveUserFromHospital",
                <RemoveUserFromHospitalPopup node={node} mutate={mutate} />,
              )
            }
            variant="Error"
          >
            {ta("حذف یوزر از روی این بیمارستان")}
          </Button>
        )}
      </FormActions>
    </div>
  );
};

export default HospitalUserTab;
