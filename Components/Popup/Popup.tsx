"use client";

import { Fragment, useContext, useEffect } from "react";
import classes from "./Popup.module.css";
import PopupContext from "../Store/PopupContext";
import { lockScroll } from "../helpers/scrollLock";

const BASE_Z = 90;

const Popup = () => {
  const { popups, closePopup } = useContext(PopupContext);
  const open = !!popups && Object.keys(popups).length > 0;

  // the page behind an open popup stays put (and floating buttons step aside)
  useEffect(() => (open ? lockScroll() : undefined), [open]);

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
