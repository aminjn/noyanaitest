import { useContext, useState } from "react";
import usePopup from "../Hooks/usePopup";
import Button from "../UI/Button";
import classes from "./LogoutPopup.module.css";
import Act from "../UI/Act";
import { API } from "../config";
import useUser from "../Hooks/useUser";
import { mutate } from "swr";
import SocketContext from "../Store/SocketContext";
import useProgress from "../Hooks/useProgress";
import useLocale from "../Hooks/useLocale";
import useScopedLocale from "../Hooks/useScopedLocale";
import { tbaseRegular, tmdMedium } from "../UI/Typography";

const LogoutPopup = () => {
  const { closePopup } = usePopup();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { refreshUser } = useUser(true);

  const { reconnect } = useContext(SocketContext);

  const push = useProgress();

  const getContent = useScopedLocale(["common"]);

  return (
    <div className={classes.main}>
      <legend className={`${classes.title} ${tmdMedium}`}>
        {getContent("logout")}
      </legend>
      <p className={`${classes.description} ${tbaseRegular}`}>
        {getContent("logoutDescription")}
      </p>
      <div className={classes.actions}>
        <Button
          onClick={() => closePopup()}
          radius="High"
          size="L"
          variant="Primary"
          mode="Outline"
        >
          {getContent("cancel")}
        </Button>
        <Button
          isLoading={isLoading}
          onClick={() => setIsLoading(true)}
          size="L"
          radius="High"
          variant="Error"
          mode="Fill"
        >
          {getContent("logout")}
        </Button>
      </div>
      <Act
        path={isLoading ? `${API}/auth` : null}
        onDone={(status) => {
          setIsLoading(false);
          if (!status) return;
          mutate(() => true, undefined, { revalidate: false });
          reconnect();
          closePopup();
          push("/");
        }}
      />
    </div>
  );
};

export default LogoutPopup;
