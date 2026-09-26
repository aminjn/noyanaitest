import { Fragment, useEffect, useRef, useState } from "react";
import classes from "./MobileUserButton.module.css";
import Ixon from "../UI/Ixon";
import UserLineIcon from "../Icons/UserLineIcon";
import XMarkIcon from "../Icons/XMarkIcon";
import useUser from "../Hooks/useUser";
import usePopup from "../Hooks/usePopup";
import AuthPopup from "../Popups/AuthPopup";
import HostedImage from "../UI/HostedImage";
import useUserMenus from "./useUserMenus";
import Link from "@/Components/i18n/Link";
import { tbaseDemiBold, tbaseMedium, tsmRegular } from "../UI/Typography";
import SwitchProfile, { SwitchProfilePopup } from "./SwitchProfile";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common"];
const MobileUserButton = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { user } = useUser();

  const getContent = useScopedLocale(LOCALE_NS);

  const { setPopup } = usePopup();

  const userMenus = useUserMenus();

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const listener = (e: MouseEvent) => {
      if (
        !containerRef.current ||
        !e.target ||
        !containerRef.current.contains(e.target as Node)
      ) {
        return setIsOpen(false);
      }
    };
    setTimeout(() => {
      window.addEventListener("click", listener, false);
    }, 10);
    return () => window.removeEventListener("click", listener, false);
  }, [isOpen]);

  return (
    <div className={classes.main} ref={containerRef}>
      <button
        className={classes.button}
        onClick={() => {
          if (!user) return setPopup("Auth", <AuthPopup />);
          setIsOpen((prev) => !prev);
        }}
      >
        <Ixon width="1rem">{isOpen ? <XMarkIcon /> : <UserLineIcon />}</Ixon>
      </button>
      {isOpen && (
        <div className={classes.menu}>
          <div
            className={classes.user}
            onClick={() => setPopup("switch", <SwitchProfilePopup />)}
          >
            <div className={classes.avatar}>
              <HostedImage
                src={user?.avatar}
                alt={user?.username}
                sizes="3rem"
                fill
              />
            </div>
            <div className={classes.userContent}>
              <span className={`${classes.userName} ${tbaseMedium}`}>
                {user?.username || getContent("user")}
              </span>
              <span className={`${classes.phone} ${tsmRegular}`}>
                {user?.phone}
              </span>
            </div>
          </div>
          <div className={classes.links}>
            {userMenus.map((menu) => (
              <Fragment key={menu.title}>
                {menu.href ? (
                  <Link
                    className={`${classes.item} ${tsmRegular}`}
                    href={menu.href}
                    onClick={() => setIsOpen(false)}
                  >
                    <Ixon width="1.25rem">{menu.icon}</Ixon>
                    <span>{getContent(menu.title)}</span>
                  </Link>
                ) : (
                  <button
                    className={`${classes.item} ${classes.action} ${tbaseDemiBold}`}
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
  );
};

export default MobileUserButton;
