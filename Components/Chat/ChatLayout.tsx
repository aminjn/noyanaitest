"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/Components/i18n/navigation";
import useUser from "../Hooks/useUser";
import LoginRequired from "../UI/LoginRequired";
import classes from "./ChatLayout.module.css";
import ChatSidebar from "./ChatSidebar";
import CurrentChat from "./CurrentChat";
import { lockScroll } from "../helpers/scrollLock";

const ChatLayout = () => {
  const { user } = useUser();
  const pathname = usePathname();

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isSidebarOpen) return;

    const unlock = lockScroll();

    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSidebarOpen(false);
    };
    document.addEventListener("keyup", listener, false);

    return () => {
      unlock();
      document.removeEventListener("keyup", listener, false);
    };
  }, [isSidebarOpen]);

  if (!user) return <LoginRequired />;
  return (
    <div className={classes.main}>
      <div
        className={`${classes.sidebarBackdrop} ${
          isSidebarOpen ? classes.sidebarBackdropOpen : ""
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />
      <div
        className={`${classes.sidebarWrap} ${
          isSidebarOpen ? classes.sidebarWrapOpen : ""
        }`}
      >
        <ChatSidebar onClose={() => setIsSidebarOpen(false)} />
      </div>
      <CurrentChat onOpenSidebar={() => setIsSidebarOpen(true)} />
    </div>
  );
};

export default ChatLayout;
