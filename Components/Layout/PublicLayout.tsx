import { ReactNode } from "react";
import classes from "./PublicLayout.module.css";
import PublicHeader from "./PublicHeader";
import PublicFooter from "./PublicFooter";
import AnalyticsTracker from "../Analytics/AnalyticsTracker";
import BottomNav from "./BottomNav";
import PwaInstallPrompt from "../Pwa/PwaInstallPrompt";

const PublicLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className={classes.main}>
      <AnalyticsTracker />
      <PublicHeader />
      {children}
      <PublicFooter />
      <BottomNav />
      <PwaInstallPrompt />
    </main>
  );
};

export default PublicLayout;
