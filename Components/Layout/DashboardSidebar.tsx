import { useMemo } from "react";
import classes from "./DashboardSidebar.module.css";
import PanelSidebar, { LinkMap } from "./PanelSidebar";
import DashboardIcon from "../Icons/DashboardIcon";
import ReceiptIcon from "../Icons/ReceiptIcon";
import BookIcon from "../Icons/BookIcon";
import Bell01Icon from "../Icons/Bell01Icon";
import HeadphoneIcon from "../Icons/HeadphoneIcon";
import ChatIcon from "../Icons/ChatIcon";

const DashboardSidebar = () => {
  const links = useMemo<LinkMap>(
    () => [
      { icon: <DashboardIcon />, show: true, title: "dashboard", target: "" },
      {
        icon: <ReceiptIcon />,
        show: true,
        title: "invoices",
        target: "invoice",
      },
      { icon: <BookIcon />, show: true, title: "bookings", target: "booking" },
      {
        icon: <HeadphoneIcon />,
        show: true,
        title: "support",
        target: "support",
      },
      {
        icon: <Bell01Icon />,
        show: true,
        title: "notifications",
        target: "notification",
      },
      { icon: <ChatIcon />, show: true, title: "chats", target: "chat" },
    ],
    [],
  );
  return <PanelSidebar links={links} panel="dashboard" />;
};

export default DashboardSidebar;
