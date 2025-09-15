import { API } from "@/Components/config";
import useForm from "@/Components/Hooks/useForm";
import useLocale from "@/Components/Hooks/useLocale";
import usePopup from "@/Components/Hooks/usePopup";
import Form from "@/Components/UI/Form";
import FormTitle from "@/Components/UI/FormTitle";
import PopupCard from "@/Components/UI/PopupCard";
import SearchServer from "@/Components/UI/SearchServer";
import { IInsurance } from "./DoctorInsurancesTab";
import classes from "./AddInsurancePopup.module.css";
import Button from "@/Components/UI/Button";
import FormActions from "@/Components/Admin/UI/FormActions";
import SelectNoResult from "@/Components/UI/SelectNoResult";

const AddInsurancePopup = ({ mutate }: { mutate: () => unknown }) => {
  const getContent = useLocale();

  const { closePopup } = usePopup();

  const { setInput, submit, isLoading } = useForm<{ insurance: string }>({
    path: (inp) => `${API}/doctor/insurance/${inp.insurance}`,
    method: "POST",
    hasProblem: (inp) => {
      console.log(inp);
      if (!inp.insurance) return getContent("checkInput");
    },
    mutator: () => ({}),
    successCb: () => {
      mutate();
      closePopup();
    },
  });

  return (
    <PopupCard>
      <Form onSubmit={submit} className={classes.main}>
        <FormTitle>{getContent("addInsurance")}</FormTitle>
        <SearchServer<IInsurance>
          path={`${API}/doctor/insurance`}
          method="POST"
          getLabel={(node) => <div className={classes.option}>{node.name}</div>}
          onChange={(e) =>
            setInput((prev) => ({ ...prev, insurance: e?._id || "" }))
          }
          readOnly={isLoading}
          //TODO:Hook this up
          noResult={
            <SelectNoResult>
              {getContent("clickToRequestAddInsurance")}
            </SelectNoResult>
          }
          title={getContent("insurance")}
        />
        <FormActions>
          <Button type="submit">{getContent("submit")}</Button>
          <Button variant="Neutral" onClick={() => closePopup()}>
            {getContent("cancel")}
          </Button>
        </FormActions>
      </Form>
    </PopupCard>
  );
};

export default AddInsurancePopup;
