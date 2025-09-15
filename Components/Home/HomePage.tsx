"use client";

import List from "../Admin/UI/List";
import usePopup from "../Hooks/usePopup";
import useProgress from "../Hooks/useProgress";
import LogoutPopup from "../Popups/LogoutPopup";
import Button from "../UI/Button";
import classes from "./HomePage.module.css";

const HomePage = () => {
  const { setPopup } = usePopup();

  const push = useProgress();

  return (
    <List>
      <Button onClick={() => setPopup("Logout", <LogoutPopup />)}>خروج</Button>
      <Button onClick={() => push("secretarypanel")}>Secretary Panel</Button>
      <Button onClick={() => push("chat")}>Chat</Button>
      <Button onClick={() => push("insurancepanel")}>Insurance Panel</Button>
      <Button onClick={() => push("pharmacypanel")}>Pharmacy Panel</Button>
      <Button onClick={() => push("clinicpanel")}>clinic Panel</Button>
    </List>
  );
};

export default HomePage;
