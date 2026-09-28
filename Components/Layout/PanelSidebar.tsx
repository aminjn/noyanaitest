import useSWR from "swr";
import useUser from "../Hooks/useUser";
import DoctorSidebar from "./DoctorSidebar";
import classes from "./PanelSidebar.module.css";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { Fragment, ReactNode, useMemo } from "react";
import { ContentKey } from "../Enums/contentKeys";
import { usePathname } from "@/Components/i18n/navigation";
import Ixon from "../UI/Ixon";
import Link from "@/Components/i18n/Link";
import Loading from "../Admin/UI/Loading";
import ChevronIcon from "../Icons/ChevronIcon";
import HostedImage from "../UI/HostedImage";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import CommandPalette, { CommandItem } from "../UI/CommandPalette";

const LOCALE_NS: ContentNamespace[] = ["common", "layoutPanel"];

export type LinkMapItem = {
  icon: ReactNode;
  title: ContentKey;
  className?: string;
  side?: ReactNode;
  // pending work on this page (invites, orders…) shown as a count pill
  badge?: number;
  // section heading shown above the first item of each group
  group?: ContentKey;
  // other first-level segments that also light this item up (a hub page
  // whose detail pages live elsewhere)
  match?: string[];
  show: boolean;
} & (
  | { target: string; onClick?: never }
  | { onClick: () => unknown; target?: never }
);

export type LinkMap = LinkMapItem[];

const LinkItem = ({
  panel,
  item: { icon, title, className, onClick, side, target, badge, match },
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
    return segments[1] === target || (!!match && match.includes(segments[1]));
  }, [match, panel, pathname, target]);

  const content = useMemo(
    () => (
      <Fragment>
        <Ixon width="1.25rem">{icon}</Ixon>
        <span>{getContent(title)}</span>
        {!!side && <span className={classes.side}>{side}</span>}
        {!!badge && badge > 0 && <span className={classes.badge}>{badge > 99 ? "99+" : badge}</span>}
      </Fragment>
    ),
    [badge, getContent, icon, side, title],
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
  const getContent = useScopedLocale(LOCALE_NS);

  const commands = useMemo<CommandItem[]>(
    () =>
      links
        .filter((l) => l.show && l.target !== undefined)
        .map((l) => ({
          id: `${l.target}${l.title}`,
          label: getContent(l.title),
          hint: l.group ? getContent(l.group) : undefined,
          icon: l.icon,
          href: `/${panel}${l.target ? `/${l.target}` : ""}`,
        })),
    [getContent, links, panel],
  );

  if (!user) return <Loading />;
  return (
    <div className={classes.main}>
      <CommandPalette items={commands} className={classes.command} />
      <nav className={classes.bar}>
        {links
          .filter((item) => item.show)
          .map((item, i, shown) => (
            <Fragment key={`${item.target}${item.title}`}>
              {!!item.group && item.group !== shown[i - 1]?.group && (
                <span className={classes.group}>{getContent(item.group)}</span>
              )}
              <LinkItem item={item} panel={panel} />
            </Fragment>
          ))}
      </nav>
      <Link href="/dashboard" className={classes.user}>
        <div className={classes.avatar}>
          <HostedImage
            src={user.avatar}
            alt={user.username || ""}
            fill
            sizes="2.5rem"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className={classes.userDetails}>
          <span className={classes.userName}>{user.username || getContent("user")}</span>
          <span className={classes.userPhone}>{user.phone}</span>
        </div>
        <Ixon width="1.125rem" className={classes.userChevron}>
          <ChevronIcon />
        </Ixon>
      </Link>
    </div>
  );
};

export default PanelSidebar;
