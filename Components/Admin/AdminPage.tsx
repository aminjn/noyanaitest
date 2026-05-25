"use client";
import { useState } from "react";
import usePopup from "../Hooks/usePopup";
import Button, {
  ButtonMode,
  buttonModes,
  ButtonRadius,
  buttonRadiuses,
  ButtonSize,
  buttonSizes,
  ButtonVariant,
  buttonVariants,
} from "../UI/Button";
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
import FillIdentityPopup from "./FillIdentityPopup";
import PodPopup from "./PodPopup";
import TabSystem from "./UI/TabSystem";
import ClientTabSystem from "../UI/ClientTabSystem";
import CupIcon from "../Icons/CupIcon";
import SelectInput from "../UI/SelectInput";
import DashboardIcon from "../Icons/DashboardIcon";

const AdminPage = () => {
  const { setPopup, closePopup } = usePopup();
  const [notif, setNotif] = useState<string>("");

  const [btnVariant, setBtnVariant] = useState<ButtonVariant>("Primary");
  const [btnMode, setBtnMode] = useState<ButtonMode>("Fill");
  const [btnSize, setBtnSize] = useState<ButtonSize>("XL");
  const [btnRadius, setBtnRadius] = useState<ButtonRadius>("Normal");

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
                    </div>,
                  )
                }
              >
                Open Second Popup
              </Button>
            </div>,
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
        <SelectInput
          title="Variant"
          options={buttonVariants.reduce(
            (acc, el) => ({ ...acc, [el]: el }),
            {},
          )}
          onChange={(e) =>
            setBtnVariant(
              (prev) =>
                buttonVariants.find((el) => el === e.target.value) || prev,
            )
          }
          defaultValue={btnVariant}
        />
        <SelectInput
          title="Mode"
          defaultValue={btnMode}
          options={buttonModes.reduce((acc, el) => ({ ...acc, [el]: el }), {})}
          onChange={(e) =>
            setBtnMode(
              (prev) => buttonModes.find((el) => el === e.target.value) || prev,
            )
          }
        />
        <SelectInput
          title="Size"
          defaultValue={btnSize}
          options={buttonSizes.reduce((acc, el) => ({ ...acc, [el]: el }), {})}
          onChange={(e) =>
            setBtnSize(
              (prev) => buttonSizes.find((el) => el === e.target.value) || prev,
            )
          }
        />
        <SelectInput
          title="Radius"
          defaultValue={btnRadius}
          options={buttonRadiuses.reduce(
            (acc, el) => ({ ...acc, [el]: el }),
            {},
          )}
          onChange={(e) =>
            setBtnRadius(
              (prev) =>
                buttonRadiuses.find((el) => el === e.target.value) || prev,
            )
          }
        />
        <Button
          leadIcon={<DashboardIcon />}
          tailIcon={<DashboardIcon />}
          variant={btnVariant}
          size={btnSize}
          mode={btnMode}
          radius={btnRadius}
        >{`${btnVariant}-${btnMode}-${btnRadius}-${btnSize}`}</Button>
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
      <Button onClick={() => setPopup("Tity", <FillIdentityPopup />)}>
        Tity
      </Button>
      <Button onClick={() => setPopup("Pod", <PodPopup />)}>Pod</Button>
      <ClientTabSystem
        items={[
          { id: "one", title: "One", icon: <CupIcon />, content: <p>One</p> },
          { id: "Two", title: "Two", icon: <CupIcon />, content: <p>Two</p> },
          { id: "Three", title: "Three", content: <p>Three</p> },
        ]}
      />
    </Box>
  );
};

export default AdminPage;
