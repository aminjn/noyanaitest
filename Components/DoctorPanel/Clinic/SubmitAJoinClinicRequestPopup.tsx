import PopupCard from "@/Components/UI/PopupCard";
import classes from "./SubmitAJoinClinicRequestPopup.module.css";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
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
import { mutate as globalMutate } from "swr";
import SubmitClinicAdditionRequestPopup from "./SubmitClinicAdditionRequestPopup";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelClinic"];

const SubmitAJoinClinicRequestPopup = ({
  mutate,
}: {
  mutate: () => unknown;
}) => {
  const getContent = useScopedLocale(NS);

  const { closePopup, setPopup } = usePopup();

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
          // Not listed yet -> switch to the "add this clinic" request form.
          noResult={
            <SelectNoResult
              onClick={() => {
                closePopup();
                setPopup(
                  "SubmitClinicAdditionRequest",
                  <SubmitClinicAdditionRequestPopup
                    mutate={() => globalMutate(`${API}/doctor/clinicaddition`)}
                  />,
                );
              }}
            >
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
