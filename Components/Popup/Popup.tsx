"use client";

import { Fragment, useContext } from "react";
import classes from "./Popup.module.css";
import PopupContext from "../Store/PopupContext";

const BASE_Z = 90;

const Popup = () => {
  const { popups, closePopup } = useContext(PopupContext);

  if (!popups) return null;
  return (
    <Fragment>
      {Object.entries(popups).map(([key, popup], i) => (
        <Fragment key={key}>
          <div
            className={classes.blur}
            onClick={() => closePopup(key)}
            style={{ zIndex: i + BASE_Z }}
          />
          <div className={classes.content} style={{ zIndex: BASE_Z + i + 1 }}>
            {popup}
          </div>
        </Fragment>
      ))}
    </Fragment>
  );
};
export default Popup;
