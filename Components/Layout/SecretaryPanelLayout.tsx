import { ReactNode } from "react";
import PanelLayout from "./PanelLayout";
import classes from "./SecretaryPanelLayout.module.css";
import SecretaryPanelSidebar from "./SecretaryPanelSidebar";

const SecretaryPanelLayout = ({ children }: { children: ReactNode }) => {
  return (
    <PanelLayout sidebar={<SecretaryPanelSidebar />}>{children}</PanelLayout>
  );
};

export default SecretaryPanelLayout;
