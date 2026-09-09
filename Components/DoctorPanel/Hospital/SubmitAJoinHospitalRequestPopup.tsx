import PopupCard from "@/Components/UI/PopupCard";
import classes from "./SubmitAJoinHospitalRequestPopup.module.css";
import useLocale from "@/Components/Hooks/useLocale";
import SearchServer from "@/Components/UI/SearchServer";
import { API } from "@/Components/config";
import useForm from "@/Components/Hooks/useForm";
import { IHospital } from "@/Components/Admin/Hospital/AdminManageHospitalsPage";
import usePopup from "@/Components/Hooks/usePopup";
import AreaInput from "@/Components/UI/AreaInput";
import Button from "@/Components/UI/Button";
import Form from "@/Components/UI/Form";
import FormTitle from "@/Components/UI/FormTitle";
import SelectNoResult from "@/Components/UI/SelectNoResult";

const SubmitAJoinHospitalRequestPopup = ({
  mutate,
}: {
  mutate: () => unknown;
}) => {
  const getContent = useLocale();

  const { closePopup } = usePopup();

  const { setInput, isLoading, submit } = useForm<{
    hospital: string;
    message: string;
  }>({
    path: `${API}/doctor/hospitaljoin`,
    method: "POST",
    successCb: () => {
      mutate();
      closePopup();
    },
    hasProblem: (inp) => (!inp.hospital ? getContent("checkInput") : false),
  });

  return (
    <PopupCard className={classes.main}>
      <Form className={classes.content} onSubmit={submit}>
        <FormTitle>{getContent("joinHospitalRequest")}</FormTitle>
        <SearchServer<IHospital>
          method="POST"
          title={getContent("hospitalName")}
          path={`${API}/doctor/hospital`}
          getLabel={(node) => (
            <div className={classes.option}>
              <span className={classes.hospitalName}>{node.name}</span>
              <span className={classes.hospitalAddress}>{node.address}</span>
            </div>
          )}
          onChange={(e) =>
            setInput((prev) => ({ ...prev, hospital: e?._id || "" }))
          }
          readOnly={isLoading}
          //TODO:Hook this up
          noResult={
            <SelectNoResult>
              {getContent("clickToRequestAddHospital")}
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

export default SubmitAJoinHospitalRequestPopup;
