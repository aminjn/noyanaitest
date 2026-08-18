import { ReactNode, useEffect, useState } from "react";
import classes from "./PanelLayout.module.css";
import { LicenseManager } from "ag-grid-enterprise";
import Loading from "../Admin/UI/Loading";
import PublicHeader from "./PublicHeader";
import RemoteBreadCrump from "../UI/RemoteBreadCrump";
import useUser from "../Hooks/useUser";
import LoginRequired from "../UI/LoginRequired";
import Ixon from "../UI/Ixon";
import BarsIcon from "../Icons/BarsIcon";
import XMarkIcon from "../Icons/XMarkIcon";
import useLocale from "../Hooks/useLocale";

const PanelLayout = ({
  children,
  sidebar,
}: {
  children: ReactNode;
  sidebar: ReactNode;
}) => {
  const { user, isUserLoading } = useUser();
  const getContent = useLocale();

  const [keySat, setKeySat] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    LicenseManager.setLicenseKey(
      "[v3][0102]_MTc2NzEzOTIwMDAwMA==e688a08fb8acde46d9bb3b15eaac16ff",
    );
    setKeySat(true);
  }, []);

  useEffect(() => {
    if (!isSidebarOpen) return;

    document.body.style.overflow = "hidden";

    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSidebarOpen(false);
    };
    document.addEventListener("keyup", listener, false);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keyup", listener, false);
    };
  }, [isSidebarOpen]);

  if (!keySat) return <Loading />;
  if (isUserLoading) return <Loading />;
  if (!user) return <LoginRequired />;
  return (
    <div className={classes.main}>
      <PublicHeader />
      <RemoteBreadCrump />
      <button
        type="button"
        className={classes.sidebarToggle}
        aria-label={getContent("menu")}
        onClick={() => setIsSidebarOpen(true)}
      >
        <Ixon width="1.25rem">
          <BarsIcon />
        </Ixon>
        <span>{getContent("menu")}</span>
      </button>
      <div className={classes.content}>
        <div
          className={`${classes.sidebarBackdrop} ${
            isSidebarOpen ? classes.sidebarBackdropOpen : ""
          }`}
          onClick={() => setIsSidebarOpen(false)}
        />
        <div
          className={`${classes.sidebar} ${
            isSidebarOpen ? classes.sidebarOpen : ""
          }`}
        >
          <button
            type="button"
            className={classes.sidebarClose}
            aria-label={getContent("close")}
            onClick={() => setIsSidebarOpen(false)}
          >
            <Ixon width="1.125rem">
              <XMarkIcon />
            </Ixon>
          </button>
          {sidebar}
        </div>
        <div className={classes.children}>{children}</div>
      </div>
    </div>
  );
};

export default PanelLayout;
