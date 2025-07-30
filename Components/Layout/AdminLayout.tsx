import { ReactNode, useEffect, useState } from "react";
import classes from "./AdminLayout.module.css";
import useUser, { UserRole } from "../Hooks/useUser";
import NotFoundPage from "../NotFound/NotFoundPage";
import AdminSidebar from "../Admin/UI/AdminSidebar";
import { LicenseManager } from "ag-grid-enterprise";

const hasAccessToAdmin: UserRole[] = ["admin", "notadmin"];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();

  const [keySat, setKeySat] = useState<boolean>(false);

  useEffect(() => {
    LicenseManager.setLicenseKey(
      "[v3][0102]_MTc2NzEzOTIwMDAwMA==e688a08fb8acde46d9bb3b15eaac16ff"
    );
    setKeySat(true);
  }, []);

  if (!keySat) return null;
  if (!user || !hasAccessToAdmin.includes(user.role)) return <NotFoundPage />;
  return (
    <div className={classes.main}>
      <AdminSidebar />
      <div className={classes.content}>{children}</div>
    </div>
  );
};

export default AdminLayout;
