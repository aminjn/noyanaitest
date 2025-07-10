"use client";

import { Fragment, useContext } from "react";
import classes from "./Popup.module.css";
import PopupContext from "../Store/PopupContext";
const Popup = () => {
  const popupCTX = useContext(PopupContext);

  if (!popupCTX.popup) return null;
  return (
    <Fragment>
      {!!popupCTX.popup && (
        <Fragment>
          <div className={classes.blur} onClick={() => popupCTX.closePopup()} />
          <div className={classes.content}>{popupCTX.popup}</div>
        </Fragment>
      )}
    </Fragment>
  );
};
export default Popup;
