"use client";
import useLocale from "@/Components/Hooks/useLocale";
import classes from "./PharmacyFillPrescriptionPage.module.css";
import Form from "@/Components/UI/Form";
import useForm from "@/Components/Hooks/useForm";
import { API } from "@/Components/config";
import Button from "@/Components/UI/Button";
import Input from "@/Components/UI/Input";

const PharmacyFillPrescriptionPage = () => {
  const getContent = useLocale();

  const { setInput, submit, isLoading } = useForm<{ tracking: string }>({
    path: `${API}/pharmacy/prescription`,
    method: "POST",
  });

  return (
    <div className={classes.main}>
      <div className={classes.title}>
        <h1>{getContent("fillingPrescription")}</h1>
      </div>
      <div className={classes.finder}>
        <legend>{getContent("fillPrescriptionLegend")}</legend>
        <Form onSubmit={submit}>
          <Input
            onChange={(e) =>
              setInput((prev) => ({ ...prev, tracking: e.target.value }))
            }
          />
          <Button isLoading={!!isLoading} type="submit">
            {getContent("searchForPrescription")}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default PharmacyFillPrescriptionPage;
