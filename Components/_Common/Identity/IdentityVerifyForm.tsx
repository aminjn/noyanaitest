"use client";

import classes from "./IdentityVerifyForm.module.css";
import { API } from "@/Components/config";
import useForm from "@/Components/Hooks/useForm";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import Form from "@/Components/UI/Form";
import Input from "@/Components/UI/Input";
import DateInput from "@/Components/UI/DateInput";
import Button from "@/Components/UI/Button";
import Ixon from "@/Components/UI/Ixon";
import ShieldCheckIcon from "@/Components/Icons/ShieldCheckIcon";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common"];

// Identity verification for an account without one (POST /user/identity):
// national ID + birth date, checked against the civil registry and Shahkar
// (the phone must be registered to that ID). Shown wherever a flow needs
// an identity instead of a dead-end "identity not found" message.
const IdentityVerifyForm = ({ onDone }: { onDone: () => unknown }) => {
  const getContent = useScopedLocale(NS);
  const { setInput, isLoading, submit } = useForm<{
    nationalId: string;
    birthDate: Date;
  }>({
    path: `${API}/user/identity`,
    method: "POST",
    successCb: () => onDone(),
  });

  return (
    <div className={classes.main}>
      <div className={classes.head}>
        <Ixon width="1.5rem" className={classes.icon}>
          <ShieldCheckIcon />
        </Ixon>
        <div>
          <strong>{getContent("identityVerifyTitle")}</strong>
          <p>{getContent("identityVerifyIntro")}</p>
        </div>
      </div>
      <Form className={classes.form} onSubmit={submit}>
        <Input
          title={getContent("identityNationalId")}
          inputMode="numeric"
          onChange={(e) =>
            setInput((prev) => ({ ...prev, nationalId: e.target.value }))
          }
        />
        <DateInput
          title={getContent("identityBirthDate")}
          onChange={(e) => setInput((prev) => ({ ...prev, birthDate: e }))}
        />
        <Button type="submit" isLoading={isLoading}>
          {getContent("identityVerifySubmit")}
        </Button>
      </Form>
    </div>
  );
};

export default IdentityVerifyForm;
