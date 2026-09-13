import { Fragment, useState } from "react";
import classes from "./MobileUserButton.module.css";
import Ixon from "../UI/Ixon";
import UserLineIcon from "../Icons/UserLineIcon";
import XMarkIcon from "../Icons/XMarkIcon";
import useUser from "../Hooks/useUser";
import usePopup from "../Hooks/usePopup";
import AuthPopup from "../Popups/AuthPopup";
import HostedImage from "../UI/HostedImage";
import useScopedLocale from "../Hooks/useScopedLocale";
import useUserMenus from "./useUserMenus";
import Link from "next/link";
const MobileUserButton = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { user } = useUser();

  const getContent = useScopedLocale(["common"]);

  const { setPopup } = usePopup();

  const userMenus = useUserMenus();

  return (
    <div className={classes.main}>
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
          <div className={classes.user}>
            <div className={classes.avatar}>
              <HostedImage
                src={user?.avatar}
                alt={user?.username}
                sizes="3rem"
                fill
              />
            </div>
            <div className={classes.userContent}>
              <span className={classes.userName}>
                {user?.username || getContent("user")}
              </span>
              <span>{user?.phone}</span>
            </div>
          </div>
          <div className={classes.links}>
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
  );
};

export default MobileUserButton;
