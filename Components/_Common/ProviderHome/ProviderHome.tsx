"use client";

import { ReactNode } from "react";
import useSWR from "swr";
import { useIntlLocale, useRouter } from "@/Components/i18n/navigation";
import Link from "@/Components/i18n/Link";
import classes from "./ProviderHome.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useAcl from "@/Components/Hooks/useAcl";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import ActionInbox from "@/Components/UI/ActionInbox";
import Ixon from "@/Components/UI/Ixon";
import CheckCircleIcon from "@/Components/Icons/CheckCircleIcon";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import useCenterDoctors, {
  CenterKind,
} from "@/Components/_Common/CenterDoctors/useCenterDoctors";
import useOrdersTodo from "./useOrdersTodo";
import ProviderTrend from "./ProviderTrend";
import CenterJoinInbox from "@/Components/_Common/CenterDoctors/CenterJoinInbox";

export type ProviderKind =
  | "clinic"
  | "hospital"
  | "pharmacy"
  | "paraClinic"
  | "insurance";

const NS: ContentNamespace[] = ["common", "providerHome"];

const panelRoot: Record<ProviderKind, string> = {
  clinic: "/clinicpanel",
  hospital: "/hospitalpanel",
  pharmacy: "/pharmacypanel",
  paraClinic: "/paraClinicPanel",
  insurance: "/insurancepanel",
};

const list = <T,>(value: unknown): T[] => (Array.isArray(value) ? value : []);
const load = (url: string) => fetcher({ url }).then((res) => res.data);

// Doctor join requests, accepted / rejected right on the home page.
const CenterJoinInline = ({ kind }: { kind: CenterKind }) => {
  const { busy, incoming, answer } = useCenterDoctors(kind);
  if (!incoming.length) return null;
  return <CenterJoinInbox requests={incoming} busy={busy} answer={answer} />;
};

type Tile = {
  key: string;
  label: ContentKey;
  value?: number;
  note?: string;
  target: string;
  alert?: boolean;
};

// Shared dashboard home for the centre panels (2026-09 UX restructure):
// "waiting for you" first, then the numbers that matter, each one a link to
// where it's managed - the Doctolib Pro / Practo Ray home pattern, instead
// of a page that only showed the licence card.
const ProviderHome = ({
  kind,
  children,
}: {
  kind: ProviderKind;
  // Panel-specific widgets below the shared blocks (e.g. the licence card).
  children?: ReactNode;
}) => {
  const getContent = useScopedLocale(NS);
  const locale = useIntlLocale();
  const router = useRouter();
  const hasAccess = useAcl(kind);
  const root = panelRoot[kind];
  useBreadCrump([{ title: getContent("dashboard"), target: root }]);

  const isOwner = hasAccess();
  const hasOrders =
    (kind === "pharmacy" || kind === "paraClinic") && hasAccess("readOrders");
  const hasDoctors = kind === "clinic" || kind === "hospital";

  const orders = useOrdersTodo(
    kind === "pharmacy" ? "pharmacy" : "paraClinic",
    hasOrders,
  );
  const products = useSWR(
    kind === "pharmacy" && hasAccess("readProducts")
      ? `${API}/pharmacy/myProduct`
      : null,
    load,
  );
  const packages = useSWR(
    kind === "pharmacy" && hasAccess("readProductPackages")
      ? `${API}/pharmacy/productPackage`
      : null,
    load,
  );
  const tests = useSWR(
    kind === "paraClinic" && hasAccess("readTests")
      ? `${API}/paraClinic/myTest`
      : null,
    load,
  );
  // same SWR key as useCenterDoctors, so this is one request
  const doctors = useSWR<{ members?: unknown[]; incoming?: unknown[] }>(
    hasDoctors && isOwner ? `${API}/${kind}/doctor` : null,
    load,
  );
  const team = useSWR(isOwner ? `${API}/acl/${kind}/secretary` : null, load);
  const invites = useSWR(
    isOwner ? `${API}/acl/${kind}/secretaryrequest` : null,
    load,
  );
  const articles = useSWR(
    hasAccess("readArticles") ? `${API}/blog/${kind}` : null,
    (url: string) =>
      fetcher({ url }).then((res) => (Array.isArray(res.data) ? res.data : [])),
  );

  // Pharmacy setup checklist (2026-09, like the doctor panel's): what a new
  // pharmacy must do before patients can find and order from it. Same SWR key
  // as PharmacyPanelLayout, so no extra request.
  const profile = useSWR<{
    name?: string;
    address?: string;
    avatar?: string;
    location?: { coordinates?: number[] };
  } | null>(kind === "pharmacy" && isOwner ? `${API}/pharmacy` : null, load);
  const setup =
    kind === "pharmacy" && isOwner && profile.data && products.data
      ? [
          {
            key: "profile",
            label: "phSetupProfile" as ContentKey,
            target: "profile",
            done: !!profile.data.name && !!profile.data.address && !!profile.data.avatar,
          },
          {
            key: "location",
            label: "phSetupLocation" as ContentKey,
            target: "profile",
            done: profile.data.location?.coordinates?.length === 2,
          },
          {
            key: "products",
            label: "phSetupProducts" as ContentKey,
            target: "product",
            done: list<{ isActive?: boolean; price?: number }>(products.data).some(
              (p) => p?.isActive && (p?.price || 0) > 0,
            ),
          },
        ]
      : [];
  const setupLeft = setup.filter((s) => !s.done).length;

  const num = new Intl.NumberFormat(locale);
  const todo = hasOrders ? orders.count : 0;
  const pendingInvites = list<{ status?: string }>(invites.data).filter(
    (el) => el?.status === "Pending",
  ).length;

  const tiles: Tile[] = [
    hasOrders && {
      key: "orders",
      label: "incomingOrders" as ContentKey,
      value: orders.loaded ? todo : undefined,
      note: getContent("homeToFulfil"),
      target: "order",
      alert: todo > 0,
    },
    hasDoctors &&
      isOwner && {
        key: "doctors",
        label: "doctors" as ContentKey,
        value: doctors.data ? list(doctors.data.members).length : undefined,
        target: "doctor",
      },
    kind === "pharmacy" &&
      hasAccess("readProducts") && {
        key: "products",
        label: "products" as ContentKey,
        value: products.data ? list(products.data).length : undefined,
        target: "product",
      },
    kind === "pharmacy" &&
      hasAccess("readProductPackages") && {
        key: "packages",
        label: "productPackages" as ContentKey,
        value: packages.data ? list(packages.data).length : undefined,
        target: "productPackage",
      },
    kind === "paraClinic" &&
      hasAccess("readTests") && {
        key: "tests",
        label: "tests" as ContentKey,
        value: tests.data ? list(tests.data).length : undefined,
        target: "test",
      },
    isOwner && {
      key: "team",
      label: "teamTitle" as ContentKey,
      value: team.data ? list(team.data).length : undefined,
      note: pendingInvites
        ? getContent("homeInvitesPending").replace(
            "${1}",
            num.format(pendingInvites),
          )
        : undefined,
      target: "secretary",
    },
    hasAccess("readArticles") && {
      key: "articles",
      label: "articles" as ContentKey,
      value: articles.data ? list(articles.data).length : undefined,
      target: "article",
    },
  ].filter(Boolean) as Tile[];

  const todos =
    todo > 0
      ? [
          {
            id: "orders",
            lead: <span className={classes.count}>{num.format(todo)}</span>,
            title: getContent("homeOrdersTodo"),
            subtitle: getContent("homeOrdersTodoHint"),
            actions: [
              {
                label: getContent("homeOpen"),
                kind: "primary" as const,
                onClick: () => router.push(`${root}/order`),
              },
            ],
          },
        ]
      : [];
  const joinRequests = list(doctors.data?.incoming).length;
  const allClear = todos.length === 0 && joinRequests === 0;
  return (
    <div className={classes.main}>
      {setupLeft > 0 && (
        <section className={classes.setup}>
          <div className={classes.setupHead}>
            <h2 className={classes.title}>{getContent("phSetupTitle")}</h2>
            <span className={classes.setupBadge}>
              {getContent("dpdStepsLeft", [num.format(setupLeft)])}
            </span>
          </div>
          <p className={classes.setupHint}>{getContent("phSetupHint")}</p>
          <div className={classes.setupBar} aria-hidden>
            <span style={{ width: `${((setup.length - setupLeft) / setup.length) * 100}%` }} />
          </div>
          <ul className={classes.setupSteps}>
            {setup.map((step) => (
              <li key={step.key}>
                <Link
                  href={`${root}/${step.target}`}
                  className={`${classes.setupStep} ${step.done ? classes.setupDone : ""}`}
                >
                  <span className={classes.setupCheck}>
                    {step.done && (
                      <Ixon width="1rem">
                        <CheckCircleIcon />
                      </Ixon>
                    )}
                  </span>
                  <span>{getContent(step.label)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={classes.section}>
        <h2 className={classes.title}>{getContent("homeTodoTitle")}</h2>
        {joinRequests > 0 && (kind === "clinic" || kind === "hospital") && (
          <CenterJoinInline kind={kind} />
        )}
        {todos.length > 0 && <ActionInbox items={todos} highlight />}
        {allClear && (
          <div className={classes.allClear}>
            <Ixon width="1.25rem">
              <CheckCircleIcon />
            </Ixon>
            <span>{getContent("homeAllClear")}</span>
          </div>
        )}
      </section>

      {tiles.length > 0 && (
        <section className={classes.section}>
          <h2 className={classes.title}>{getContent("homeOverview")}</h2>
          <div className={classes.tiles}>
            {tiles.map((tile) => (
              <Link
                key={tile.key}
                href={`${root}/${tile.target}`}
                className={`${classes.tile} ${tile.alert ? classes.alert : ""}`}
              >
                <span className={classes.tileValue}>
                  {tile.value === undefined ? "—" : num.format(tile.value)}
                </span>
                <span className={classes.tileLabel}>
                  {getContent(tile.label)}
                </span>
                {tile.note && (
                  <span className={classes.tileNote}>{tile.note}</span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {hasOrders && (kind === "pharmacy" || kind === "paraClinic") && (
        <ProviderTrend kind={kind} />
      )}
      {hasDoctors && <ProviderTrend kind={kind as "clinic" | "hospital"} />}

      {children}
    </div>
  );
};

export default ProviderHome;
