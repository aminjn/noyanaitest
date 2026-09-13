import { ReactNode, useMemo } from "react";
import { ContentKey } from "../Enums/contentKeys";
import CategoriesIcon from "../Icons/CategoriesIcon";
import Calendar02Icon from "../Icons/Calendar02Icon";
import HeadphoneIcon from "../Icons/HeadphoneIcon";
import LogoutIcon from "../Icons/LogoutIcon";
import usePopup from "../Hooks/usePopup";
import LogoutPopup from "../Popups/LogoutPopup";

type MenuMap = ({ title: ContentKey; icon: ReactNode } & (
  | {
      href: string;
      action?: never;
    }
  | { href?: never; action: () => unknown }
))[];

const useUserMenus = () => {
  const { setPopup } = usePopup();

  const userMenus = useMemo<MenuMap>(
    () => [
      { title: "dashboard", icon: <CategoriesIcon />, href: "/dashboard" },
      {
        title: "myBookings",
        icon: <Calendar02Icon />,
        href: "/dashboard/booking",
      },
      { title: "support", icon: <HeadphoneIcon />, href: "/dashboard/support" },

      {
        title: "signout",
        icon: <LogoutIcon />,
        action: () => setPopup("Signout", <LogoutPopup />),
      },
    ],
    [setPopup],
  );
  return userMenus;
};

export default useUserMenus;
