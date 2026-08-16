import {
  Fragment,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useLocale from "../Hooks/useLocale";
import usePopup from "../Hooks/usePopup";
import useProgress from "../Hooks/useProgress";
import useUser from "../Hooks/useUser";
import ChevronIcon from "../Icons/ChevronIcon";
import UserCircleIcon from "../Icons/UserCircleIcon";
import UserSquareIcon from "../Icons/UserSquareIcon";
import AuthPopup from "../Popups/AuthPopup";
import Button from "../UI/Button";
import classes from "./UserButton.module.css";
import { ContentKey } from "../Enums/contentKeys";
import CategoriesIcon from "../Icons/CategoriesIcon";
import Calendar02Icon from "../Icons/Calendar02Icon";
import HeadphoneIcon from "../Icons/HeadphoneIcon";
import LogoutIcon from "../Icons/LogoutIcon";
import LogoutPopup from "../Popups/LogoutPopup";
import Link from "next/link";
import Ixon from "../UI/Ixon";

type MenuMap = ({ title: ContentKey; icon: ReactNode } & (
  | {
      href: string;
      action?: never;
    }
  | { href?: never; action: () => unknown }
))[];

const UserButton = () => {
  const { setPopup } = usePopup();
  const { user } = useUser(undefined);

  const push = useProgress();

  const getContent = useLocale();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const menus = useMemo<MenuMap>(
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

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (
        !containerRef.current ||
        !e.target ||
        !containerRef.current.contains(e.target as Node)
      )
        return setIsOpen(false);
    };
    window.addEventListener("click", listener, false);
    return () => window.removeEventListener("click", listener, false);
  }, []);

  // if (!!user)
  //   return (
  //     <div>
  //       <Button
  //         className={classes.main}
  //         iconWidth="1.25rem"
  //         onClick={() => }
  //       >
  //         {user.phone}
  //       </Button>
  //     </div>
  //   );
  return (
    <div className={classes.main} ref={containerRef}>
      <Button
        leadIcon={!!user ? <UserCircleIcon /> : undefined}
        tailIcon={!!user ? <ChevronIcon /> : undefined}
        onClick={() =>
          !!user ? setIsOpen((prev) => !prev) : setPopup("Auth", <AuthPopup />)
        }
        variant="Primary"
        mode={!!user ? "Outline" : "Fill"}
        size="L"
        radius="Medium"
      >
        {!!user ? user.phone : getContent("loginOrSignup")}
      </Button>
      {isOpen && (
        <div className={classes.menuContainer}>
          {menus.map((menu) => (
            <Fragment key={menu.title}>
              {menu.href ? (
                <Link
                  className={classes.item}
                  href={menu.href}
                  onClick={() => setIsOpen(false)}
                >
                  <Ixon width="1.25rem">{menu.icon}</Ixon>
                  <span>{getContent(menu.title)}</span>
                </Link>
              ) : (
                <button
                  className={`${classes.item} ${classes.action}`}
                  onClick={() => {
                    setIsOpen(false);
                    menu.action?.();
                  }}
                >
                  <Ixon width="1.25rem">{menu.icon}</Ixon>
                  <span>{getContent(menu.title)}</span>
                </button>
              )}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserButton;
