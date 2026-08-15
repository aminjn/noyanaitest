import { useState } from "react";
import {
  contactRequestSubjectContentKeys,
  contactRequestSubjects,
  IContactRequest,
} from "../Admin/ContactRequest/AdminManageContactRequestsPage";
import { API } from "../config";
import useForm from "../Hooks/useForm";
import useLocale from "../Hooks/useLocale";
import classes from "./ContactForm.module.css";
import Form from "../UI/Form";
import Input from "../UI/Input";
import AreaInput from "../UI/AreaInput";
import Button from "../UI/Button";
import ChevronIcon from "../Icons/ChevronIcon";
import { tsmMedium } from "../UI/Typography";
import Ixon from "../UI/Ixon";
const ContactForm = () => {
  const getContent = useLocale();

  const [didSubmit, setDidSubmit] = useState<boolean>(false);

  const { input, setInput, isLoading, submit } = useForm<IContactRequest>({
    path: `${API}/public/contact`,
    method: "POST",
    hasProblem: (inp) => {
      if (!inp.name || !inp.content || !inp.phone || !inp.subject)
        return getContent("checkInput");
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
        />
        <div className={classes.wrap}>
          <Input
            readOnly={isLoading || didSubmit}
            onChange={(e) =>
              setInput((prev) => ({ ...prev, phone: e.target.value }))
            }
            title={getContent("phoneNumber")}
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
