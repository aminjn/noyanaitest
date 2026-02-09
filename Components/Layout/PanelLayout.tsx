import { ReactNode, useEffect, useState } from "react";
import classes from "./PanelLayout.module.css";
import { LicenseManager } from "ag-grid-enterprise";
import Loading from "../Admin/UI/Loading";
import PublicHeader from "./PublicHeader";
import RemoteBreadCrump from "../UI/RemoteBreadCrump";
import useUser from "../Hooks/useUser";
import LoginRequired from "../UI/LoginRequired";

const PanelLayout = ({
  children,
  sidebar,
}: {
  children: ReactNode;
  sidebar: ReactNode;
}) => {
  const { user, isUserLoading } = useUser();

  const [keySat, setKeySat] = useState<boolean>(false);

  useEffect(() => {
    LicenseManager.setLicenseKey(
      "[v3][0102]_MTc2NzEzOTIwMDAwMA==e688a08fb8acde46d9bb3b15eaac16ff",
    );
    setKeySat(true);
  }, []);

  if (!keySat) return <Loading />;
  if (isUserLoading) return <Loading />;
  if (!user) return <LoginRequired />;
  return (
    <div className={classes.main}>
      <PublicHeader />
      <RemoteBreadCrump />
      <div className={classes.content}>
        {sidebar}
        <div className={classes.children}>{children}</div>
      </div>
    </div>
  );
};

export default PanelLayout;
