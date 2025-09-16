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
import Debugger from "./Debugger";
import SipManager from "./SipManager";
import VoiceManager from "./VoiceManager";
import TelephonePopup from "./TelephonePopup";

const AdminPage = () => {
  const { setPopup, closePopup } = usePopup();
  const [notif, setNotif] = useState<string>("");

  const pushNotification = useNotification();

  return (
    <Box className={classes.main}>
      <Button
        onClick={() =>
          setPopup(
            "Test1",
            <div className={classes.popup1}>
              <p>Hello I&apos;m Popup</p>
              <Button
                onClick={() =>
                  setPopup(
                    "Test2",
                    <div className={classes.popup2}>
                      <p>Another One Bites The Dust</p>
                      <div>
                        <Button onClick={() => closePopup("Test2")}>
                          Close this
                        </Button>
                        <Button onClick={() => closePopup("Test1")}>
                          Close First One
                        </Button>
                        <Button onClick={() => closePopup()}>Close All</Button>
                      </div>
                    </div>
                  )
                }
              >
                Open Second Popup
              </Button>
            </div>
          )
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
      <Button onClick={() => setPopup("Debugger", <Debugger />)}>Debug</Button>
      <Button onClick={() => setPopup("sipManager", <SipManager />)}>
        Sip
      </Button>
      <Button onClick={() => setPopup("voiceManager", <VoiceManager />)}>
        Voice
      </Button>
      <Button onClick={() => setPopup("Telephone", <TelephonePopup />)}>
        Telephone
      </Button>
    </Box>
  );
};

export default AdminPage;
