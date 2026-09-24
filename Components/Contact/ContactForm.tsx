import { useState } from "react";
import {
  contactRequestSubjectContentKeys,
  contactRequestSubjects,
  IContactRequest,
} from "../Admin/ContactRequest/AdminManageContactRequestsPage";
import { API } from "../config";
import useForm from "../Hooks/useForm";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import classes from "./ContactForm.module.css";
import Form from "../UI/Form";
import Input from "../UI/Input";
import AreaInput from "../UI/AreaInput";
import Button from "../UI/Button";
import ChevronIcon from "../Icons/ChevronIcon";
import { tsmMedium } from "../UI/Typography";
import Ixon from "../UI/Ixon";
import { isMobile } from "../helpers/Validators";

const NS: ContentNamespace[] = ["common", "contactPage"];
const ContactForm = () => {
  const getContent = useScopedLocale(NS);

  const [didSubmit, setDidSubmit] = useState<boolean>(false);

  const [didTry, setDidTry] = useState<boolean>(false);

  const { input, setInput, isLoading, submit } = useForm<IContactRequest>({
    path: `${API}/public/contact`,
    method: "POST",
    hasProblem: (inp) => {
      if (!inp.name) return getContent("missinNameErrorMessage");
      if (!inp.content) return getContent("missingMessageErrorMessage");
      if (!inp.phone) return getContent("missingPhoneErrorMessage");
      if (!isMobile(Number(inp.phone)))
        return getContent("badPhoneErrorMessage");
      if (!inp.subject) return getContent("missingSubjectErrorMessage");
      return false;
    },
    successCb: () => {
      setDidSubmit(true);
    },
  });

  return (
    <Form
      className={classes.main}
      onSubmit={() => {
        if (didSubmit) return;
        setDidTry(true);
        submit();
      }}
    >
      <h3 className={classes.title}>{getContent("sendMessage")}</h3>
      <div className={classes.fields}>
        <Input
          readOnly={isLoading || didSubmit}
          onChange={(e) =>
            setInput((prev) => ({ ...prev, name: e.target.value }))
          }
          title={getContent("fullName")}
          required
          inputClass={didTry ? (!!input.name ? "" : classes.invalid) : ""}
        />
        <div className={classes.wrap}>
          <Input
            readOnly={isLoading || didSubmit}
            onChange={(e) =>
              setInput((prev) => ({ ...prev, phone: e.target.value }))
            }
            title={getContent("phoneNumber")}
            required
            inputClass={
              didTry
                ? isMobile(Number(input.phone))
                  ? ""
                  : classes.invalid
                : ""
            }
            pattern="[0-9]*"
          />
          <Input
            readOnly={isLoading || didSubmit}
            onChange={(e) =>
              setInput((prev) => ({ ...prev, email: e.target.value }))
            }
            title={getContent("emailAddress")}
          />
        </div>
        <div className={classes.selectBox}>
          <legend className={classes.selectTitle}>
            <span className={classes.required}>* </span>
            {getContent("selectSubject")}
          </legend>
          <div className={classes.options}>
            {contactRequestSubjects.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => {
                  if (isLoading || didSubmit) return;
                  setInput((prev) => ({ ...prev, subject: s }));
                }}
                className={`${classes.option} ${input.subject === s ? classes.activeOption : ""} ${tsmMedium}`}
              >
                <span className={classes.check} />
                <span>{getContent(contactRequestSubjectContentKeys[s])}</span>
              </button>
            ))}
          </div>
        </div>
        <AreaInput
          readOnly={isLoading || didSubmit}
          title={getContent("messageContent")}
          onChange={(e) =>
            setInput((prev) => ({ ...prev, content: e.target.value }))
          }
          required
          inputClass={didTry ? (!!input.content ? "" : classes.invalid) : ""}
        />
      </div>
      <div className={classes.actions}>
        <Button
          type="submit"
          isLoading={isLoading}
          tailIcon={
            <Ixon style={{ transform: "rotatez(90deg)" }}>
              <ChevronIcon />
            </Ixon>
          }
          variant="Primary"
          mode="Fill"
          radius="Medium"
          size="L"
        >
          {getContent(didSubmit ? "yourMessageSubmitted" : "sendMessage")}
        </Button>
      </div>
    </Form>
  );
};

export default ContactForm;
