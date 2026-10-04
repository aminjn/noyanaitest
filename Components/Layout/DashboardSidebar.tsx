import { useMemo } from "react";
import classes from "./DashboardSidebar.module.css";
import PanelSidebar, { LinkMap } from "./PanelSidebar";
import DashboardIcon from "../Icons/DashboardIcon";
import ReceiptIcon from "../Icons/ReceiptIcon";
import BookIcon from "../Icons/BookIcon";
import Bell01Icon from "../Icons/Bell01Icon";
import HeadphoneIcon from "../Icons/HeadphoneIcon";
import ChatIcon from "../Icons/ChatIcon";
import WalletIcon from "../Icons/WalletIcon";
import PackageIcon from "../Icons/PackageIcon";
import LocationIcon from "../Icons/LocationIcon";
import CrownIcon from "../Icons/CrownIcon";
import { ContentKey } from "../Enums/contentKeys";

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
        icon: <PackageIcon />,
        show: true,
        title: "orders",
        target: "order",
      },
      {
        icon: <WalletIcon />,
        show: true,
        title: "transactions",
        target: "transaction",
      },
      {
        icon: <LocationIcon />,
        show: true,
        title: "addresses",
        target: "address",
      },
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
      // the «پرو» membership (2026-10)
      { icon: <CrownIcon />, show: true, title: "proPlan", target: "pro" },
    ],
    [],
  );
  return <PanelSidebar links={links} panel="dashboard" />;
};

export default DashboardSidebar;
