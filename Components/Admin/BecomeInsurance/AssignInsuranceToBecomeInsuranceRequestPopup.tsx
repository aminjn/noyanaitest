import { API } from "@/Components/config";
import { IInsurance } from "@/Components/DoctorPanel/Insurance/DoctorInsurancesTab";
import useForm from "@/Components/Hooks/useForm";
import usePopup from "@/Components/Hooks/usePopup";
import { IBecomeInsuranceRequest } from "@/Components/Layout/InsurancePanelLayout";
import Form from "@/Components/UI/Form";
import NodesSelector from "@/Components/UI/NodesSelector";
import PopupCard from "@/Components/UI/PopupCard";
import FormActions from "../UI/FormActions";
import Button from "@/Components/UI/Button";
import { ta } from "@/Components/Admin/i18n/adminText";

const AssignInsuranceToBecomeInsuranceRequestPopup = ({
  mutate,
  node,
}: {
  mutate: () => unknown;
  node: IBecomeInsuranceRequest<{ User: Record<never, never> }>;
}) => {
  const { closePopup } = usePopup();

  const { submit, setInput } = useForm<{ insurance: string }>({
    path: (inp) => `${API}/auto/insurance/${inp.insurance}`,
    method: "POST",
    hasProblem: (inp) => {
      if (!inp.insurance) return ta("لطفا بیمه را انتخاب کنید");
    },
    mutator: () => ({ user: node.user?._id }),
    successCb: () => {
      mutate();
      closePopup();
    },
  });
  return (
    <PopupCard>
      <Form onSubmit={submit}>
        <NodesSelector
          multi={false}
          path={`${API}/auto/insurance`}
          getOptionLabel={(node) =>
            (node as IInsurance).name || (node as IInsurance)._id
          }
          getOptionValue={(node) => (node as IInsurance)._id}
          title={ta("بیمه")}
          onChange={(e) =>
            setInput((prev) => ({ ...prev, insurance: e || undefined }))
          }
        />
        <FormActions>
          <Button type="submit">{ta("تایید")}</Button>
          <Button type="button" variant="Neutral" onClick={() => closePopup()}>
            {ta("انصراف")}
          </Button>
        </FormActions>
      </Form>
    </PopupCard>
  );
};

export default AssignInsuranceToBecomeInsuranceRequestPopup;
