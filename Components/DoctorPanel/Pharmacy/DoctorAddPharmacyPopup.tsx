import { API } from "@/Components/config";
import useForm from "@/Components/Hooks/useForm";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import usePopup from "@/Components/Hooks/usePopup";
import Form from "@/Components/UI/Form";
import FormTitle from "@/Components/UI/FormTitle";
import PopupCard from "@/Components/UI/PopupCard";
import SearchServer from "@/Components/UI/SearchServer";
import { IPharmacy } from "./DoctorPharmaciesTab";
import SelectNoResult from "@/Components/UI/SelectNoResult";
import FormActions from "@/Components/Admin/UI/FormActions";
import Button from "@/Components/UI/Button";

import classes from "./DoctorAddPharmacyPopup.module.css";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelPharmacy"];

const DoctorAddPharmacyPopup = ({ mutate }: { mutate: () => unknown }) => {
  const getContent = useScopedLocale(NS);

  const { closePopup } = usePopup();

  const { isLoading, setInput, submit } = useForm<{ pharmacy: string }>({
    path: (inp) => `${API}/doctor/pharmacy/${inp.pharmacy}`,
    method: "POST",
    hasProblem: (inp) => {
      if (!inp.pharmacy) return getContent("checkInput");
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
        <FormTitle>{getContent("addPharmacy")}</FormTitle>
        <SearchServer<IPharmacy>
          getLabel={(node) => <span>{node.name}</span>}
          method="POST"
          path={`${API}/doctor/pharmacy`}
          onChange={(e) => setInput((prev) => ({ ...prev, pharmacy: e?._id }))}
          title={getContent("pharmacyName")}
          //TODO: hook this shit
          noResult={
            <SelectNoResult>
              {getContent("clickToRequestAddPharmacy")}
            </SelectNoResult>
          }
          readOnly={isLoading}
        />
        <FormActions>
          <Button type="submit">{getContent("submit")}</Button>
          <Button variant="Neutral">{getContent("cancel")}</Button>
        </FormActions>
      </Form>
    </PopupCard>
  );
};

export default DoctorAddPharmacyPopup;
