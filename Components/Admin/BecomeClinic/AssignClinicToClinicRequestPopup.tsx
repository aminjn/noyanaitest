import { IBecomeClinicRequest } from "@/Components/ClinicPanel/BecomeClinicPage";
import { IClinic } from "../Clinic/AdminManageClinicsPage";
import NodesSelector from "@/Components/UI/NodesSelector";
import { API } from "@/Components/config";
import Form from "@/Components/UI/Form";
import FormActions from "../UI/FormActions";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import useForm from "@/Components/Hooks/useForm";
import PopupCard from "@/Components/UI/PopupCard";

const AssignClinicToClinicRequestPopup = ({
  node,
  mutate,
}: {
  node: IBecomeClinicRequest<{ user: true }>;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  const { submit, setInput } = useForm<{ clinic: string }>({
    path: (inp) => `${API}/auto/clinic/${inp.clinic}`,
    method: "POST",
    hasProblem: (inp) => {
      if (!inp.clinic) return "کلینیک را انتخاب نمایید";
    },
    mutator: () => ({
      user: node.user._id,
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
          path={`${API}/auto/clinic`}
          getOptionLabel={(node) =>
            (node as IClinic).name || (node as IClinic)._id
          }
          getOptionValue={(node) => (node as IClinic)._id}
          title="انتخاب کلینیک"
          defaultValue={node._id}
          onChange={(e) =>
            setInput((prev) => ({ ...prev, clinic: e || undefined }))
          }
        />
        <FormActions>
          <Button type="submit">تایید</Button>
          <Button type="button" onClick={() => closePopup()}>
            انصراف
          </Button>
        </FormActions>
      </Form>
    </PopupCard>
  );
};

export default AssignClinicToClinicRequestPopup;
