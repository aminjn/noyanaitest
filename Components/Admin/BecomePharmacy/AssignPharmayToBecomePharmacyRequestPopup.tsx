import { API } from "@/Components/config";
import { IPharmacy } from "@/Components/DoctorPanel/Pharmacy/DoctorPharmaciesTab";
import useForm from "@/Components/Hooks/useForm";
import usePopup from "@/Components/Hooks/usePopup";
import { IBecomePharmacyRequest } from "@/Components/PharmacyPanel/BecomePharmacyPage";
import Form from "@/Components/UI/Form";
import NodesSelector from "@/Components/UI/NodesSelector";
import PopupCard from "@/Components/UI/PopupCard";
import TableActions from "../UI/TableActions";
import Button from "@/Components/UI/Button";

const AssignPharmacyToBecomePharmacyRequestPopup = ({
  mutate,
  node,
}: {
  node: IBecomePharmacyRequest<{ user: true }>;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();
  const { submit, setInput, isLoading } = useForm<{ pharmacy: string }>({
    path: (inp) => `${API}/auto/pharmacy/${inp.pharmacy}`,
    method: "POST",
    hasProblem: (inp) => {
      if (!inp.pharmacy) return "لطفا داروخانه را انتخاب نمایید";
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
          path={`${API}/auto/pharmacy`}
          multi={false}
          title="داروخانه"
          getOptionLabel={(node) =>
            (node as IPharmacy).name || (node as IPharmacy)._id
          }
          getOptionValue={(node) => (node as IPharmacy)._id}
          readOnly={isLoading}
          onChange={(e) =>
            setInput((prev) => ({ ...prev, pharmacy: e || undefined }))
          }
        />
        <TableActions>
          <Button type="submit" isLoading={isLoading}>
            تایید
          </Button>
          <Button variant="Neutral" type="button" onClick={() => closePopup()}>
            انصراف
          </Button>
        </TableActions>
      </Form>
    </PopupCard>
  );
};

export default AssignPharmacyToBecomePharmacyRequestPopup;
