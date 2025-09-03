import { useMemo } from "react";
import classes from "./DashboardSidebar.module.css";
import PanelSidebar, { LinkMap } from "./PanelSidebar";
import DashboardIcon from "../Icons/DashboardIcon";
import ReceiptIcon from "../Icons/ReceiptIcon";
import BookIcon from "../Icons/BookIcon";

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
    ],
    []
  );
  return <PanelSidebar links={links} panel="dashboard" />;
};

export default DashboardSidebar;
