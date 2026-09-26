import { API } from "@/Components/config";
import useForm from "@/Components/Hooks/useForm";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
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
import { mutate as globalMutate } from "swr";
import NewInsuranceAdditionRequestPopup from "./NewInsuranceAdditionRequestPopup";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelInsurance"];

const AddInsurancePopup = ({ mutate }: { mutate: () => unknown }) => {
  const getContent = useScopedLocale(NS);

  const { closePopup, setPopup } = usePopup();

  const { setInput, submit, isLoading } = useForm<{ insurance: string }>({
    path: (inp) => `${API}/doctor/insurance/${inp.insurance}`,
    method: "POST",
    hasProblem: (inp) => {
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
          // Not listed yet -> switch to the "add this insurance" request form.
          noResult={
            <SelectNoResult
              onClick={() => {
                closePopup();
                setPopup(
                  "NewInsuranceAdditionRequestPopup",
                  <NewInsuranceAdditionRequestPopup
                    mutate={() => globalMutate(`${API}/doctor/insuranceaddition`)}
                  />,
                );
              }}
            >
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
