import useSWR from "swr";
import useUser from "../Hooks/useUser";
import DoctorSidebar from "./DoctorSidebar";
import classes from "./PanelSidebar.module.css";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { Fragment, ReactNode, useMemo } from "react";
import { ContentKey } from "../Enums/contentKeys";
import { usePathname } from "next/navigation";
import Ixon from "../UI/Ixon";
import Link from "next/link";
import Loading from "../Admin/UI/Loading";
import ChevronIcon from "../Icons/ChevronIcon";
import HostedImage from "../UI/HostedImage";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "layoutPanel"];

export type LinkMapItem = {
  icon: ReactNode;
  title: ContentKey;
  className?: string;
  side?: ReactNode;
  show: boolean;
} & (
  | { target: string; onClick?: never }
  | { onClick: () => unknown; target?: never }
);

export type LinkMap = LinkMapItem[];

const LinkItem = ({
  panel,
  item: { icon, title, className, onClick, side, target },
}: {
  item: LinkMapItem;
  panel: string;
}) => {
  const getContent = useScopedLocale(LOCALE_NS);
  const pathname = usePathname();

  const isActive = useMemo<boolean>(() => {
    if (target === undefined) return false;
    // /<panel>/<target>/... -> active for the section and all its subpages
    const segments = pathname.split("?")[0].split("/").filter(Boolean);
    if (segments[0] !== panel) return false;
    if (!target) return segments.length === 1;
    return segments[1] === target;
  }, [panel, pathname, target]);

  const content = useMemo(
    () => (
      <Fragment>
        <Ixon width="1.25rem">{icon}</Ixon>
        <span>{getContent(title)}</span>
        {!!side && <span className={classes.side}>{side}</span>}
      </Fragment>
    ),
    [getContent, icon, side, title],
  );

  return (
    <Fragment>
      {target !== undefined ? (
        <Link
          className={`${classes.link} ${
            isActive ? classes.activeLink : ""
          } ${className}`}
          href={`/${panel}/${target}`}
        >
          {content}
        </Link>
      ) : (
        <button className={`${classes.link} ${className}`} onClick={onClick}>
          {content}
        </button>
      )}
    </Fragment>
  );
};

const PanelSidebar = ({ links, panel }: { links: LinkMap; panel: string }) => {
  const { user } = useUser();

  if (!user) return <Loading />;
  return (
    <div className={classes.main}>
      <Link href="/dashboard" className={classes.user}>
        <div className={classes.avatar}>
          <HostedImage
            src={user.avatar}
            alt={user.username || ""}
            fill
            sizes="2.75rem"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className={classes.userDetails}>
          <span className={classes.userName}>{user.username || "کاربر"}</span>
          <span className={classes.userPhone}>{user.phone}</span>
        </div>
        <Ixon width="1.5rem" style={{ transform: "rotateZ(90deg)" }}>
          <ChevronIcon />
        </Ixon>
      </Link>
      <div className={classes.bar}>
        {links.map((item) => (
          <Fragment key={`${item.target}${item.title}`}>
            {item.show ? <LinkItem item={item} panel={panel} /> : null}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default PanelSidebar;
