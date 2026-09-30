"use client";

import useUser from "@/Components/Hooks/useUser";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import { AccessLevelModel } from "../AccessLevel/AdminManageAccessLevelsPage";

// Whether the signed-in staff member may open a hub tab: the super admin
// sees every tab; others see the tabs whose model their access level can
// list ("admin" marks a super-admin-only tab).
const useHubTabAccess = () => {
  const { user } = useUser(true);
  const hasAccess = useAccessLevel();
  return (access?: AccessLevelModel | "admin") => {
    if (user?.role === "admin") return true;
    if (!access || access === "admin") return false;
    return hasAccess(access, "readAll");
  };
};

export default useHubTabAccess;
