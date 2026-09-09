import { IBecomeHospitalRequest } from "@/Components/HospitalPanel/BecomeHospitalPage";
import { IHospital } from "../Hospital/AdminManageHospitalsPage";
import NodesSelector from "@/Components/UI/NodesSelector";
import { API } from "@/Components/config";
import Form from "@/Components/UI/Form";
import FormActions from "../UI/FormActions";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import useForm from "@/Components/Hooks/useForm";
import PopupCard from "@/Components/UI/PopupCard";

const AssignHospitalToHospitalRequestPopup = ({
  node,
  mutate,
}: {
  node: IBecomeHospitalRequest<{ user: true }>;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  const { submit, setInput } = useForm<{ hospital: string }>({
    path: (inp) => `${API}/auto/hospital/${inp.hospital}`,
    method: "POST",
    hasProblem: (inp) => {
      if (!inp.hospital) return "بیمارستان را انتخاب نمایید";
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
          path={`${API}/auto/hospital`}
          getOptionLabel={(node) =>
            (node as IHospital).name || (node as IHospital)._id
          }
          getOptionValue={(node) => (node as IHospital)._id}
          title="انتخاب بیمارستان"
          defaultValue={node._id}
          onChange={(e) =>
            setInput((prev) => ({ ...prev, hospital: e || undefined }))
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

export default AssignHospitalToHospitalRequestPopup;
