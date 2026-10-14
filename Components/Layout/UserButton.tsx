"use client";
import { Fragment, KeyboardEvent, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useSWR from "swr";
import classes from "./UserButton.module.css";
import usePopup from "../Hooks/usePopup";
import useUser, { IUser } from "../Hooks/useUser";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { ContentKey } from "../Enums/contentKeys";
import AuthPopup from "../Popups/AuthPopup";
import Button from "../UI/Button";
import Ixon from "../UI/Ixon";
import HostedImage from "../UI/HostedImage";
import ChevronIcon from "../Icons/ChevronIcon";
import CheckIcon from "../Icons/CheckIcon";
import UserLineIcon from "../Icons/UserLineIcon";
import Link from "@/Components/i18n/Link";
import ProBadge from "../Pro/ProBadge";
import useUserMenus from "./useUserMenus";
import usePanelsMap from "./usePanelsMaps";
import { Panel, panelToDashboardDict } from "./SwitchProfile";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { formatMobile } from "../helpers/phone";
import { lockScroll } from "../helpers/scrollLock";

const LOCALE_NS: ContentNamespace[] = ["common"];

// phones get the menu as a bottom sheet (same breakpoint as the header's
// compact account button)
const PHONE_QUERY = "(max-width: 500px)";

// the provider panels a member can switch to, in this order
const PROVIDER_PANELS: Panel[] = ["doctor", "clinic", "paraClinic", "hospital", "pharmacy", "insurance", "secetary"];

const panelKind: Partial<Record<Panel, ContentKey>> = {
  doctor: "doctor",
  clinic: "clinic",
  paraClinic: "paraClinic",
  hospital: "hospital",
  pharmacy: "pharmacy",
  insurance: "insurance",
};

const nameOf = (user: IUser | undefined) => {
  if (!user) return "";
  const own = String(user.username || "").trim();
  if (own) return own;
  // GET /user may carry the verified identity (given name / last name)
  const id = (user as { identity?: unknown }).identity as { givenName?: unknown; lastName?: unknown } | null | undefined;
  return [id?.givenName, id?.lastName].filter((x) => typeof x === "string" && x.trim()).join(" ");
};

const Avatar = ({ src, name, size }: { src?: string; name: string; size: string }) => (
  <span className={classes.avatar} style={{ width: size, height: size }}>
    <HostedImage src={src} alt={name} fill sizes={size} style={{ objectFit: "cover" }} />
  </span>
);

// The member's other panels (doctor profile, clinics, secretary desk ...),
// as a list in the menu - Doctolib Pro / Docplanner's account switcher.
// Shown only when there is at least one.
const PanelSwitcher = ({ onPick, onKind }: { onPick: () => void; onKind: (k?: ContentKey) => void }) => {
  const getContent = useScopedLocale(LOCALE_NS);
  const { panelsMap, currentPanel, isLoading } = usePanelsMap();
  // the secretary desk counts only for someone who works for (or is invited
  // by) a doctor or a centre
  const { data: desk } = useSWR<{ workplaces?: unknown[]; invites?: unknown[] }>(`${API}/secretary/overview`, (url: string) =>
    fetcher({ url }).then((res) => res?.data),
  );
  const hasDesk = (Array.isArray(desk?.workplaces) && desk!.workplaces.length > 0) || (Array.isArray(desk?.invites) && desk!.invites.length > 0);

  const rows = useMemo(
    () => PROVIDER_PANELS.filter((p) => (p === "secetary" ? hasDesk : !!panelsMap[p]?.active)),
    [panelsMap, hasDesk],
  );

  const kind = rows.map((p) => panelKind[p]).find(Boolean);
  useEffect(() => {
    if (!isLoading) onKind(kind);
  }, [isLoading, kind, onKind]);

  if (!rows.length) return null;
  return (
    <Fragment>
      <div className={classes.sep} role="separator" />
      <div className={classes.group} role="group" aria-labelledby="account-panels-title">
        <span id="account-panels-title" className={classes.groupTitle}>
          {getContent("yourPanels")}
        </span>
        {rows.map((p) => {
          const details = panelsMap[p];
          const current = p === currentPanel;
          const label = getContent(details.label);
          // a label getter falls back to the record id when the name is missing:
          // an id means nothing to the member, so no subtitle then
          const raw = p === "secetary" ? "" : String(details.name || "").trim();
          const name = /^[a-f0-9]{24}$/i.test(raw) || raw === "—" ? "" : raw;
          return (
            <Link
              key={p}
              href={panelToDashboardDict[p]}
              role="menuitem"
              aria-current={current ? "page" : undefined}
              className={`${classes.item} ${classes.panelItem} ${current ? classes.current : ""}`}
              onClick={onPick}
            >
              <Avatar src={p === "secetary" ? undefined : details.avatar} name={name || label} size="2rem" />
              <span className={classes.itemText}>
                <span className={classes.itemLabel}>{label}</span>
                {!!name && <span className={classes.itemSub}>{name}</span>}
              </span>
              {current && (
                <Ixon width="1.125rem" className={classes.check}>
                  <CheckIcon />
                </Ixon>
              )}
            </Link>
          );
        })}
      </div>
    </Fragment>
  );
};

const AccountPanel = ({
  user,
  id,
  sheet,
  close,
  panelRef,
}: {
  user: IUser;
  id: string;
  sheet: boolean;
  close: (focusTrigger?: boolean) => void;
  panelRef: React.RefObject<HTMLDivElement>;
}) => {
  const getContent = useScopedLocale(LOCALE_NS);
  const userMenus = useUserMenus();
  const [kind, setKind] = useState<ContentKey | undefined>();
  const name = nameOf(user);
  const phone = formatMobile(user.phone);

  const items = userMenus.filter((m) => !!m.href);
  const actions = userMenus.filter((m) => !m.href);

  // arrows / Home / End move between the rows, Tab leaves the menu
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const rows = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') || []);
    if (!rows.length) return;
    const at = rows.indexOf(document.activeElement as HTMLElement);
    const go = (i: number) => rows[(i + rows.length) % rows.length]?.focus();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      go(at + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      go(at < 0 ? rows.length - 1 : at - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      go(0);
    } else if (e.key === "End") {
      e.preventDefault();
      go(rows.length - 1);
    } else if (e.key === "Tab") {
      close();
    }
  };

  return (
    <div
      ref={panelRef}
      id={id}
      role="menu"
      aria-label={getContent("accountMenu")}
      className={`${classes.panel} ${sheet ? classes.sheet : classes.popover}`}
      onKeyDown={onKeyDown}
    >
      {sheet && <span className={classes.grabber} aria-hidden />}
      <div className={classes.head}>
        <Avatar src={user.avatar} name={name} size="3rem" />
        <div className={classes.headText}>
          <span className={classes.headName}>
            {name ? name : <bdi dir="ltr">{phone}</bdi>}
          </span>
          {!!name && (
            <bdi dir="ltr" className={classes.headPhone}>
              {phone}
            </bdi>
          )}
          <span className={classes.badges}>
            <span className={classes.roleBadge}>{getContent(kind || "personalAccount")}</span>
            <ProBadge />
          </span>
        </div>
      </div>

      <PanelSwitcher onPick={() => close()} onKind={setKind} />

      <div className={classes.sep} role="separator" />
      <div className={classes.group}>
        {items.map((menu) => (
          <Link key={menu.title} href={menu.href!} role="menuitem" className={classes.item} onClick={() => close()}>
            <Ixon width="1.25rem" className={classes.itemIcon}>
              {menu.icon}
            </Ixon>
            <span className={classes.itemLabel}>{getContent(menu.title)}</span>
          </Link>
        ))}
      </div>
      {!!actions.length && (
        <Fragment>
          <div className={classes.sep} role="separator" />
          <div className={classes.group}>
            {actions.map((menu) => (
              <button
                key={menu.title}
                type="button"
                role="menuitem"
                className={`${classes.item} ${classes.danger}`}
                onClick={() => {
                  close();
                  menu.action?.();
                }}
              >
                <Ixon width="1.25rem" className={classes.itemIcon}>
                  {menu.icon}
                </Ixon>
                <span className={classes.itemLabel}>{getContent(menu.title)}</span>
              </button>
            ))}
          </div>
        </Fragment>
      )}
    </div>
  );
};

// The header's account control: «ورود / ثبت‌نام» for a visitor; for a
// member an avatar + name (or the number) that opens the account menu - a
// popover under the button on wide screens, a bottom sheet on phones.
const UserButton = () => {
  const { setPopup } = usePopup();
  const { user } = useUser(undefined);
  const getContent = useScopedLocale(LOCALE_NS);

  const [open, setOpen] = useState(false);
  const [sheet, setSheet] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const close = useCallback((focusTrigger?: boolean) => {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  }, []);

  const toggle = () => {
    if (!open) setSheet(window.matchMedia(PHONE_QUERY).matches);
    setOpen((v) => !v);
  };

  // first row gets the focus (menu button pattern)
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() =>
      panelRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus({ preventScroll: true }),
    );
    return () => cancelAnimationFrame(id);
  }, [open, sheet]);

  // click outside / Esc / the window growing past the phone breakpoint
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (rootRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      close();
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close(true);
      }
    };
    const mq = window.matchMedia(PHONE_QUERY);
    const onMq = () => close();
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    mq.addEventListener?.("change", onMq);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener?.("change", onMq);
    };
  }, [open, close]);

  // the page stays put behind the sheet
  useEffect(() => (open && sheet ? lockScroll() : undefined), [open, sheet]);

  // signed out while the menu was open
  useEffect(() => {
    if (!user) setOpen(false);
  }, [user]);

  if (!user)
    return (
      <Fragment>
        <button
          type="button"
          className={classes.guestIcon}
          onClick={() => setPopup("Auth", <AuthPopup />)}
          aria-label={getContent("loginOrSignup")}
          data-account-trigger="mobile"
        >
          <Ixon width="1.125rem">
            <UserLineIcon />
          </Ixon>
        </button>
        <span className={classes.guestWide} data-account-trigger="desktop">
          <Button
            onClick={() => setPopup("Auth", <AuthPopup />)}
            variant="Primary"
            mode="Fill"
            size="L"
            radius="High"
            className={classes.guestButton}
          >
            {getContent("loginOrSignup")}
          </Button>
        </span>
      </Fragment>
    );

  const name = nameOf(user);
  const short = name ? name.split(/\s+/)[0] : formatMobile(user.phone);

  const panel = open ? <AccountPanel user={user} id={menuId} sheet={sheet} close={close} panelRef={panelRef} /> : null;

  return (
    <div className={classes.root} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`${classes.trigger} ${open ? classes.triggerOpen : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`${getContent("accountMenu")}: ${name || formatMobile(user.phone)}`}
        onClick={toggle}
        data-account-trigger="desktop"
      >
        <Avatar src={user.avatar} name={name} size="2rem" />
        {/* data-account-name: the header hides it when the menu needs the room */}
        <span className={classes.triggerName} data-account-name>
          {name ? short : <bdi dir="ltr">{short}</bdi>}
        </span>
        <Ixon width="1rem" className={classes.chevron}>
          <ChevronIcon />
        </Ixon>
      </button>
      {sheet
        ? open &&
          createPortal(
            <div className={classes.sheetLayer}>
              <div className={classes.backdrop} onClick={() => close()} aria-hidden />
              {panel}
            </div>,
            document.body,
          )
        : panel}
    </div>
  );
};

export default UserButton;
