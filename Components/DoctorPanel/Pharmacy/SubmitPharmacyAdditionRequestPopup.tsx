import useForm from "@/Components/Hooks/useForm";
import Form from "@/Components/UI/Form";
import PopupCard from "@/Components/UI/PopupCard";
import { IPharmacyAdditionRequest } from "./DoctorPharmacyRequestsTab";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import Input from "@/Components/UI/Input";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import SelectInput from "@/Components/UI/SelectInput";
import { provinceOptions, provinceSlugs } from "@/Components/Enums/Provinces";
import { cityOptions, citySlugs } from "@/Components/Enums/Cities";
import AreaInput from "@/Components/UI/AreaInput";
import FormActions from "@/Components/Admin/UI/FormActions";
import Button from "@/Components/UI/Button";
import classes from "./SubmitPharmacyAdditionRequestPopup.module.css";
import FormTitle from "@/Components/UI/FormTitle";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelPharmacy"];

const SubmitPharmacyAdditionRequestPopup = ({
  mutate,
}: {
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();
  const { isLoading, setInput, submit, input } =
    useForm<IPharmacyAdditionRequest>({
      path: `${API}/doctor/pharmacyaddition`,
      method: "POST",
      successCb: () => {
        mutate();
        closePopup();
      },
    });

  const getContent = useScopedLocale(NS);
  return (
    <PopupCard>
      <Form onSubmit={submit} className={classes.main}>
        <FormTitle>{getContent("newPharmacyAdditionRequest")}</FormTitle>
        <Input
          readOnly={isLoading}
          title={getContent("pharmacyName")}
          onChange={(e) =>
            setInput((prev) => ({ ...prev, name: e.target.value }))
          }
        />
        <SelectInput
          readOnly={isLoading}
          title={getContent("province")}
          options={provinceOptions}
          onChange={(e) =>
            setInput((prev) => ({
              ...prev,
              province: provinceSlugs.find((slug) => slug === e.target.value),
            }))
          }
        />
        <SelectInput
          readOnly={isLoading}
          title={getContent("city")}
          options={cityOptions(input.province)}
          onChange={(e) =>
            setInput((prev) => ({
              ...prev,
              city: citySlugs.find((c) => c === e.target.value),
            }))
          }
        />
        <Input
          readOnly={isLoading}
          title={getContent("pharmacyAddress")}
          onChange={(e) =>
            setInput((prev) => ({ ...prev, address: e.target.value }))
          }
        />
        <AreaInput
          title={getContent("description")}
          readOnly={isLoading}
          onChange={(e) =>
            setInput((prev) => ({ ...prev, description: e.target.value }))
          }
        />
        <FormActions>
          <Button
            onClick={() => closePopup()}
            variant="Neutral"
            radius="Medium"
          >
            {getContent("cancel")}
          </Button>
          <Button type="submit" isLoading={isLoading} radius="Medium">
            {getContent("submit")}
          </Button>
        </FormActions>
      </Form>
    </PopupCard>
  );
};

export default SubmitPharmacyAdditionRequestPopup;
