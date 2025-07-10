"use client";
import { useState } from "react";
import usePopup from "../Hooks/usePopup";
import Button, { buttonVariants } from "../UI/Button";
import Input from "../UI/Input";
import classes from "./AdminPage.module.css";
import Box from "./UI/Box";
import FormActions from "./UI/FormActions";
import { notificationStatuses } from "../Store/NotificationContext";
import useNotification from "../Hooks/useNotification";
import * as Colors from "@/Components/Enums/Colors";

const AdminPage = () => {
  const { setPopup } = usePopup();
  const [notif, setNotif] = useState<string>("");

  const pushNotification = useNotification();

  return (
    <Box className={classes.main}>
      <Button
        onClick={() =>
          setPopup(<div className={classes.popup}>Hello I&apos;m Popup</div>)
        }
      >
        OpenPopup
      </Button>
      <br />
      <div className={classes.input}>
        <Input title="Notif" onChange={(e) => setNotif(e.target.value)} />
      </div>
      <FormActions>
        {notificationStatuses.map((status) => (
          <Button key={status} onClick={() => pushNotification(notif, status)}>
            {status}
          </Button>
        ))}
      </FormActions>
      <br />
      <div className={classes.colors}>
        {buttonVariants.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
      </div>
      <br />
      <div className={classes.colors}>
        {Object.keys(Colors).map((color) => (
          <div className={classes.colorBox} key={color}>
            <div
              className={classes.color}
              style={{ backgroundColor: Colors[color as keyof typeof Colors] }}
            ></div>
            <span className={classes.colorLabel}>{color}</span>
          </div>
        ))}
      </div>
    </Box>
  );
};

export default AdminPage;
