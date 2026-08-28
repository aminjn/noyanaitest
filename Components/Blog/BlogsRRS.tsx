import { useState } from "react";
import clsases from "./BlogsRRS.module.css";
import useForm from "../Hooks/useForm";
import { API } from "../config";
import Form from "../UI/Form";
import useScopedLocale from "../Hooks/useScopedLocale";
import Input from "../UI/Input";
import Button from "../UI/Button";
import { tbaseMedium, txsRegular } from "../UI/Typography";

const BlogsRRS = () => {
  const [didSubmit, setDidSubmit] = useState<boolean>(false);

  const getContent = useScopedLocale(["common", "mag"]);

  const { setInput, isLoading, submit } = useForm<{ email: string }>({
    path: `${API}/public/blog`,
    method: "POST",
    successCb: () => {
      setDidSubmit(true);
    },
    hasProblem: (inp) => (!inp.email ? getContent("checkInput") : false),
  });

  return (
    <Form
      className={clsases.main}
      onSubmit={() => {
        if (didSubmit) return;
        submit();
      }}
    >
      <h4 className={`${clsases.title} ${tbaseMedium}`}>
        {getContent("subscribeToRRSTitle")}
      </h4>
      <legend className={`${clsases.legend} ${txsRegular}`}>
        {getContent("subscribeToRRSLegend")}
      </legend>
      <Input
        onChange={(e) =>
          setInput((prev) => ({ ...prev, email: e.target.value }))
        }
        placeholder={getContent("emailPlaceholder")}
        inputClass={clsases.input}
        readOnly={isLoading || didSubmit}
      />
      <Button isLoading={isLoading} type="submit" radius="High" size="M">
        {getContent(didSubmit ? "subscribed" : "subscribe")}
      </Button>
    </Form>
  );
};

export default BlogsRRS;
