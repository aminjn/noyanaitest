import { IBecomeParaClinicRequest } from "@/Components/Layout/BecomeParaClinicPage";
import { IParaClinic } from "@/Components/Layout/ParaClinicPanelLayout";
import NodesSelector from "@/Components/UI/NodesSelector";
import { API } from "@/Components/config";
import Form from "@/Components/UI/Form";
import FormActions from "../UI/FormActions";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import useForm from "@/Components/Hooks/useForm";
import PopupCard from "@/Components/UI/PopupCard";
import { ta } from "@/Components/Admin/i18n/adminText";

const AssignParaClinicToBecomeParaClinicRequestPopup = ({
  node,
  mutate,
}: {
  node: IBecomeParaClinicRequest<{ User: Record<never, never> }>;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  const { submit, setInput } = useForm<{ paraClinic: string }>({
    path: (inp) => `${API}/auto/paraClinic/${inp.paraClinic}`,
    method: "POST",
    hasProblem: (inp) => {
      if (!inp.paraClinic) return ta("پاراکلینیک را انتخاب نمایید");
    },
    mutator: () => ({
      user: node.user?._id,
    }),
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
          path={`${API}/auto/paraClinic`}
          getOptionLabel={(node) =>
            (node as IParaClinic).name || (node as IParaClinic)._id
          }
          getOptionValue={(node) => (node as IParaClinic)._id}
          title={ta("انتخاب پاراکلینیک")}
          onChange={(e) =>
            setInput((prev) => ({ ...prev, paraClinic: e || undefined }))
          }
        />
        <FormActions>
          <Button type="submit">{ta("تایید")}</Button>
          <Button type="button" onClick={() => closePopup()}>
            {ta("انصراف")}
          </Button>
        </FormActions>
      </Form>
    </PopupCard>
  );
};

export default AssignParaClinicToBecomeParaClinicRequestPopup;
