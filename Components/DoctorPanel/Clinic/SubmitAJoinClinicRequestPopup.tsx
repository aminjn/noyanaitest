import PopupCard from "@/Components/UI/PopupCard";
import classes from "./SubmitAJoinClinicRequestPopup.module.css";
import useLocale from "@/Components/Hooks/useLocale";
import SearchServer from "@/Components/UI/SearchServer";
import { API } from "@/Components/config";
import useForm from "@/Components/Hooks/useForm";
import { IClinic } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import usePopup from "@/Components/Hooks/usePopup";
import AreaInput from "@/Components/UI/AreaInput";
import Button from "@/Components/UI/Button";
import Form from "@/Components/UI/Form";
import FormTitle from "@/Components/UI/FormTitle";
import SelectNoResult from "@/Components/UI/SelectNoResult";

const SubmitAJoinClinicRequestPopup = ({
  mutate,
}: {
  mutate: () => unknown;
}) => {
  const getContent = useLocale();

  const { closePopup } = usePopup();

  const { setInput, isLoading, submit } = useForm<{
    clinic: string;
    message: string;
  }>({
    path: `${API}/doctor/clinicjoin`,
    method: "POST",
    successCb: () => {
      mutate();
      closePopup();
    },
    hasProblem: (inp) => (!inp.clinic ? getContent("checkInput") : false),
  });

  return (
    <PopupCard className={classes.main}>
      <Form className={classes.content} onSubmit={submit}>
        <FormTitle>{getContent("joinClinicRequest")}</FormTitle>
        <SearchServer<IClinic>
          method="POST"
          title={getContent("clinicName")}
          path={`${API}/doctor/clinic`}
          getLabel={(node) => (
            <div className={classes.option}>
              <span className={classes.clinicName}>{node.name}</span>
              <span className={classes.clinicAddress}>{node.address}</span>
            </div>
          )}
          onChange={(e) =>
            setInput((prev) => ({ ...prev, clinic: e?._id || "" }))
          }
          readOnly={isLoading}
          //TODO:Hook this up
          noResult={
            <SelectNoResult>
              {getContent("clickToRequestAddClinic")}
            </SelectNoResult>
          }
        />
        <AreaInput
          title={getContent("message")}
          onChange={(e) => {
            setInput((prev) => ({ ...prev, message: e.target.value }));
          }}
          readOnly={isLoading}
        />
        <Button type="submit">{getContent("submitRequest")}</Button>
      </Form>
    </PopupCard>
  );
};

export default SubmitAJoinClinicRequestPopup;
