import Link from "next/link";
import LogoLong from "../UI/LogoLong";
import classes from "./PublicHeader.module.css";
import UserButton from "./UserButton";
import { usePathname } from "next/navigation";
import { Fragment, ReactNode, useEffect, useState } from "react";
import Ixon from "../UI/Ixon";
import ChevronIcon from "../Icons/ChevronIcon";
import CallingIcon from "../Icons/CallingIcon";
import ChatBubbleIcon from "../Icons/ChatBubbleIcon";

type LinkItem<TSubed extends boolean = false> = {
  title: string;
  accent?: boolean;
} & (TSubed extends true
  ? {
      subs: { title: string; taregt: string; icon: ReactNode }[];
      target?: never;
    }
  : {
      target: string;
      subs?: never;
    });

const links: LinkItem<boolean>[] = [
  { title: "صفحه اصلی", target: "/" },
  { title: "نوبت‌دهی مطب", target: "/book" },
  {
    title: "مشاوره پزشکی",
    subs: [
      {
        title: "مشاوره پزشکی تلفنی",
        taregt: "/consult/voice",
        icon: <CallingIcon />,
      },
      {
        title: "مشاوره پزشکی متنی",
        taregt: "/consult/text",
        icon: <ChatBubbleIcon />,
      },
    ],
  },
  { title: "تشخیص با AI", target: "/wizard" },
  { title: "مجله سلامت", target: "/mag" },
  { title: "برای پزشکان", target: "/console", accent: true },
];

const WithSubs = ({ link }: { link: LinkItem<true> }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const listener = () => setIsOpen(false);
      document.addEventListener("click", listener, false);
      return () => document.removeEventListener("click", listener, false);
    }
  }, [isOpen]);

  return (
    <div className={classes.link}>
      <button className={classes.subedBtn} onClick={() => setIsOpen(true)}>
        <span>{link.title}</span>
        <Ixon width="1rem">
          <ChevronIcon />
        </Ixon>
      </button>
      {isOpen && (
        <div className={classes.subs}>
          {link.subs.map((sub) => (
            <Link key={sub.title} href={sub.taregt} className={classes.sub}>
              <Ixon className={classes.subIcon} width="1.125rem">
                {sub.icon}
              </Ixon>
              <span>{sub.title}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const PublicHeader = () => {
  const pathname = usePathname();

  return (
    <header className={classes.main}>
      <div className={classes.right}>
        <LogoLong />
      </div>
      <nav className={classes.nav}>
        {links.map((link) => (
          <Fragment key={link.title}>
            {link.target ? (
              <Link
                href={link.target}
                className={`${classes.link} ${
                  pathname === link.target ? classes.active : ""
                } ${link.accent ? classes.accent : ""}`}
              >
                {link.title}
              </Link>
            ) : (
              <WithSubs link={link as LinkItem<true>} />
            )}
          </Fragment>
        ))}
      </nav>
      <div className={classes.left}>
        <UserButton />
      </div>
    </header>
  );
};

export default PublicHeader;
