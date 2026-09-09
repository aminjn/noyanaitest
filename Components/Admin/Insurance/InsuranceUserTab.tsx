import FormActions from "../UI/FormActions";
import CreateForm from "../UI/CreateForm";
import { IInsurance } from "@/Components/DoctorPanel/Insurance/DoctorInsurancesTab";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import RemoveUserFromInsurancePopup from "./RemoveUserFromInsurancePopup";
import { getUserLabel } from "../Lib/LabelGetters";
import { IUser } from "@/Components/Hooks/useUser";
import { API } from "@/Components/config";

const InsuranceUserTab = ({
  mutate,
  node,
}: {
  node: IInsurance<{ User: Record<never, never> }>;
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
          path: `${API}/auto/insurance/${node._id}`,
          method: "POST",
          successCb: () => mutate(),
        }}
      />
      <FormActions>
        {node.user && (
          <Button
            onClick={() =>
              setPopup(
                "RemoveUserFromInsurance",
                <RemoveUserFromInsurancePopup node={node} mutate={mutate} />,
              )
            }
            variant="Error"
          >
            حذف یوزر از روی این بیمه
          </Button>
        )}
      </FormActions>
    </div>
  );
};

export default InsuranceUserTab;
