import {
  Fragment,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import Bell01Icon from "../Icons/Bell01Icon";
import LogoutIcon from "../Icons/LogoutIcon";
import LogoutPopup from "../Popups/LogoutPopup";
import Link from "@/Components/i18n/Link";
import Ixon from "../UI/Ixon";
import MobileUserButton from "./MobileUserButton";
import useUserMenus from "./useUserMenus";
import SwitchProfile from "./SwitchProfile";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common"];

const UserButton = () => {
  const { setPopup } = usePopup();
  const { user } = useUser(undefined);

  const getContent = useScopedLocale(LOCALE_NS);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const userMenus = useUserMenus();

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

  return (
    <Fragment>
      <MobileUserButton />
      <div className={classes.main} ref={containerRef}>
        <Button
          leadIcon={!!user ? <UserCircleIcon /> : undefined}
          tailIcon={!!user ? <ChevronIcon /> : undefined}
          onClick={() =>
            !!user
              ? setIsOpen((prev) => !prev)
              : setPopup("Auth", <AuthPopup />)
          }
          variant="Primary"
          mode={!!user ? "Outline" : "Fill"}
          size="L"
          radius="Medium"
          className={`${classes.button} ${isOpen ? classes.openButton : ""}`}
        >
          {!!user ? user.username || user.phone : getContent("loginOrSignup")}
        </Button>
        {isOpen && (
          <div className={classes.menuContainer}>
            <SwitchProfile />
            <div className={classes.otherMenus}>
              {userMenus.map((menu) => (
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
          </div>
        )}
      </div>
    </Fragment>
  );
};

export default UserButton;
