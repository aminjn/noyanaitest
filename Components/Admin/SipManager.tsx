import { useState } from "react";
import Button from "../UI/Button";
import PopupCard from "../UI/PopupCard";
import Act from "../UI/Act";
import { API } from "../config";
import CreateForm from "./UI/CreateForm";
import classes from "./SipManager.module.css";

const SipManager = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  return (
    <PopupCard>
      <CreateForm<{ a: string; b: string }>
        className={classes.main}
        renderer={{
          a: { type: "text", title: "a" },
          b: { type: "text", title: "b" },
        }}
        hookProps={{
          path: `${API}/admin/sip`,
          method: "POST",
        }}
      />
      {/* <Button onClick={() => setIsLoading(true)} isLoading={isLoading}>
        Go
      </Button>
      <Act
        path={isLoading ? `${API}/admin/sip` : null}
        method="POST"
        onDone={(status, result) => {
          setIsLoading(false);
          console.log(result);
        }}
      /> */}
    </PopupCard>
  );
};

export default SipManager;
