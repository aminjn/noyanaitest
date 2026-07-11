import Link from "next/link";
import LogoLong from "../UI/LogoLong";
import classes from "./PublicHeader.module.css";
import UserButton from "./UserButton";
import { usePathname } from "next/navigation";
import { Fragment, ReactNode, useEffect, useMemo, useState } from "react";
import Ixon from "../UI/Ixon";
import ChevronIcon from "../Icons/ChevronIcon";
import CallingIcon from "../Icons/CallingIcon";
import ChatBubbleIcon from "../Icons/ChatBubbleIcon";
import useLocale from "../Hooks/useLocale";
import { ContentKey } from "../Enums/contentKeys";
import SearchIcon from "../Icons/SearchIcon";
import Bell01Icon from "../Icons/Bell01Icon";
import SearchButton from "./SearchButton";

type LinkItem<TSubed extends boolean = false> = {
  title: ContentKey;
  accent?: boolean;
} & (TSubed extends true
  ? {
      subs: { title: ContentKey; taregt: string; icon: ReactNode }[];
      target?: never;
    }
  : {
      target: string;
      subs?: never;
    });

const WithSubs = ({ link }: { link: LinkItem<true> }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const getContent = useLocale();

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
        <span>{getContent(link.title)}</span>
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
              <span>{getContent(sub.title)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const PublicHeader = () => {
  const pathname = usePathname();

  const getContent = useLocale();

  const links = useMemo<LinkItem<boolean>[]>(
    () => [
      { title: "homePage", target: "/" },
      { title: "officeBook", target: "/book" },
      {
        title: "medicalConsult",
        subs: [
          {
            title: "phoneConsult",
            taregt: "/consult/voice",
            icon: <CallingIcon />,
          },
          {
            title: "textConsult",
            taregt: "/consult/text",
            icon: <ChatBubbleIcon />,
          },
        ],
      },
      { title: "aiDetection", target: "/wizard" },
      { title: "noyanClinic", target: "/clinic" },
      { title: "blog", target: "/mag" },
      { title: "forDoctors", target: "/doctorpanel", accent: true },
    ],
    [],
  );

  return (
    <header className={classes.main}>
      <Link className={classes.right} href={"/"}>
        <LogoLong />
      </Link>
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
                {getContent(link.title)}
              </Link>
            ) : (
              <WithSubs link={link as LinkItem<true>} />
            )}
          </Fragment>
        ))}
      </nav>
      <div className={classes.left}>
        <SearchButton />
        <button type="button">
          <Ixon width="1.5rem">
            <Bell01Icon />
          </Ixon>
        </button>
        <UserButton />
      </div>
    </header>
  );
};

export default PublicHeader;
