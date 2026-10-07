"use client";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import Link from "@/Components/i18n/Link";
import Ixon from "@/Components/UI/Ixon";
import ShieldCheckIcon from "@/Components/Icons/ShieldCheckIcon";
import { useMyInsurances } from "./MyInsurancesPage";
import classes from "./MyInsurancesCard.module.css";

const NS: ContentNamespace[] = ["common", "patientInsurance"];

// «بیمه‌های من» on the dashboard's profile area: what is saved, one link
// to manage it (Components/Dashboard/Insurance/MyInsurancesPage.tsx)
const MyInsurancesCard = () => {
  const getContent = useScopedLocale(NS);
  const { data } = useMyInsurances();
  if (!data?.patient) return null;
  const rows = (["basic", "supplementary"] as const).map((role) => ({
    role,
    item: data.items.find((i) => i.role === role) || null,
  }));
  return (
    <section className={classes.card} aria-label={getContent("piTitle")}>
      <header className={classes.head}>
        <span className={`${classes.icon} tone-teal`}>
          <Ixon width="1.05rem">
            <ShieldCheckIcon />
          </Ixon>
        </span>
        <b>{getContent("piTitle")}</b>
        <Link href="/dashboard/insurance" className={classes.link}>
          {data.items.length ? getContent("piCardManage") : getContent("piAdd")}
        </Link>
      </header>
      <ul className={classes.list}>
        {rows.map(({ role, item }) => (
          <li key={role}>
            <span>{role === "basic" ? getContent("bfInsBasic") : getContent("bfInsSupp")}</span>
            <strong className={item?.expired ? classes.expired : ""}>
              {item
                ? [item.insurance.name, item.plan?.name].filter(Boolean).join(" · ") +
                  (item.expired ? ` (${getContent("piExpired")})` : "")
                : getContent("piSlotEmpty")}
            </strong>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default MyInsurancesCard;
