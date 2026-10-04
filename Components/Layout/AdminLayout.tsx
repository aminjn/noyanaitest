import { ReactNode, useEffect, useState } from "react";
import classes from "./AdminLayout.module.css";
import useUser, { UserRole } from "../Hooks/useUser";
import NotFoundPage from "../NotFound/NotFoundPage";
import AdminSidebar, { canNotAdminOpen } from "../Admin/UI/AdminSidebar";
import { usePathname } from "@/Components/i18n/navigation";
import { useAccessLevelState } from "../Hooks/useAccessLevel";
import Loading from "../Admin/UI/Loading";
import Ixon from "../UI/Ixon";
import BarsIcon from "../Icons/BarsIcon";
import CloseIcon from "../Icons/CloseIcon";
import LogoLong from "../UI/LogoLong";
import { ta } from "@/Components/Admin/i18n/adminText";
import Copilot from "../Ai/Copilot/Copilot";

const hasAccessToAdmin: UserRole[] = ["admin", "notadmin"];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const pathname = usePathname();
  const { hasAccess, isLoading } = useAccessLevelState();

  // Phones/tablets: the menu is a drawer opened from the top bar.
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);


  if (!user || !hasAccessToAdmin.includes(user.role)) return <NotFoundPage />;
  // Page-level guard for restricted staff: the backend already returns 403,
  // this just stops them from getting an empty/broken admin page by URL.
  if (user.role === "notadmin") {
    if (isLoading) return <Loading />;
    // the whole path after /<adminKey>/, so "finance/orders/1" is guarded
    // by the orders page, not by whichever finance page is listed first
    const subPath = pathname.split("/").slice(2).join("/");
    if (!canNotAdminOpen(subPath, hasAccess)) return <NotFoundPage />;
  }
  return (
    <div className={classes.main}>
      <header className={classes.topbar}>
        <button
          type="button"
          className={classes.menuButton}
          onClick={() => setMenuOpen(true)}
          aria-label={ta("باز کردن منو")}
        >
          <Ixon width="1.5rem">
            <BarsIcon />
          </Ixon>
        </button>
        <span className={classes.topbarLogo}>
          <LogoLong />
        </span>
      </header>
      <div
        className={`${classes.backdrop} ${menuOpen ? classes.backdropOpen : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden
      />
      <div className={`${classes.drawer} ${menuOpen ? classes.drawerOpen : ""}`}>
        <button
          type="button"
          className={classes.closeButton}
          onClick={() => setMenuOpen(false)}
          aria-label={ta("بستن منو")}
        >
          <Ixon width="1.25rem">
            <CloseIcon />
          </Ixon>
        </button>
        <AdminSidebar />
      </div>
      <div className={classes.content}>{children}</div>
      {/* the super admin's assistant (platform stats, requests, users, finance) */}
      <Copilot profile="admin" />
    </div>
  );
};

export default AdminLayout;
