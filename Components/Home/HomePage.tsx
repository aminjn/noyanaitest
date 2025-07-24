"use client";

import usePopup from "../Hooks/usePopup";
import LogoutPopup from "../Popups/LogoutPopup";
import Button from "../UI/Button";
import classes from "./HomePage.module.css";

const HomePage = () => {
  const { setPopup } = usePopup();
  return (
    <Button onClick={() => setPopup("Logout", <LogoutPopup />)}>خروج</Button>
  );
};

export default HomePage;
