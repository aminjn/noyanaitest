import { useContext, useState } from "react";
import usePopup from "../Hooks/usePopup";
import Button from "../UI/Button";
import classes from "./LogoutPopup.module.css";
import Act from "../UI/Act";
import { API } from "../config";
import useUser from "../Hooks/useUser";
import { mutate } from "swr";
import SocketContext from "../Store/SocketContext";

const LogoutPopup = () => {
  const { closePopup } = usePopup();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { refreshUser } = useUser(true);

  const { reconnect } = useContext(SocketContext);

  return (
    <div className={classes.main}>
      <p>آیا مطمئیند؟</p>
      <div className={classes.actions}>
        <Button isLoading={isLoading} onClick={() => setIsLoading(true)}>
          بله
        </Button>
        <Button onClick={() => closePopup()}>نه</Button>
      </div>
      <Act
        path={isLoading ? `${API}/auth` : null}
        onDone={(status) => {
          setIsLoading(false);
          if (!status) return;
          mutate(() => true, undefined, { revalidate: false });
          reconnect();
          closePopup();
        }}
      />
    </div>
  );
};

export default LogoutPopup;
