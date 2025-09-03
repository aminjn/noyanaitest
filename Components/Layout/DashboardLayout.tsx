import { ReactNode } from "react";
import classes from "./DashboardLayout.module.css";
import useUser from "../Hooks/useUser";
import LoginRequired from "../UI/LoginRequired";
import PanelLayout from "./PanelLayout";
import DashboardSidebar from "./DashboardSidebar";

const DashboardLayout = ({ children }: { children?: ReactNode }) => {
  const { user } = useUser();

  if (!user) return <LoginRequired />;
  return <PanelLayout sidebar={<DashboardSidebar />}>{children}</PanelLayout>;
};

export default DashboardLayout;
