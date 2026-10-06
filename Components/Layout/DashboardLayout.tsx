import { ReactNode } from "react";
import classes from "./DashboardLayout.module.css";
import useUser from "../Hooks/useUser";
import LoginRequired from "../UI/LoginRequired";
import PanelLayout from "./PanelLayout";
import DashboardSidebar from "./DashboardSidebar";
import BottomNav from "./BottomNav";
import PwaInstallPrompt from "../Pwa/PwaInstallPrompt";

// The patient dashboard keeps the panel layout on wide screens; on phones it
// gets the same tab bar as the public site (its only other navigation was
// the burger drawer), with room left for it at the end of the content.
const DashboardLayout = ({ children }: { children?: ReactNode }) => {
  const { user } = useUser();

  if (!user) return <LoginRequired />;
  return (
    <PanelLayout sidebar={<DashboardSidebar />}>
      {children}
      <div className={classes.navSpace} aria-hidden="true" />
      <BottomNav />
      <PwaInstallPrompt />
    </PanelLayout>
  );
};

export default DashboardLayout;
