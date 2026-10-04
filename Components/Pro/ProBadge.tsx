"use client";

import classes from "./Pro.module.css";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentKey } from "@/Components/Enums/contentKeys";
import Ixon from "@/Components/UI/Ixon";
import CrownIcon from "@/Components/Icons/CrownIcon";
import { useMyPro } from "./useProData";

// «پرو» next to the user's name (header account button, dashboard
// profile) while the membership runs. `active` overrides the lookup.
const ProBadge = ({ active, className = "" }: { active?: boolean; className?: string }) => {
  const getContent = useScopedLocale();
  const { data } = useMyPro();
  const on = active ?? !!data?.active;
  if (!on) return null;
  return (
    <span className={`${classes.badge} ${className}`} title={getContent("proMember")}>
      <Ixon width="0.8rem">
        <CrownIcon />
      </Ixon>
      {getContent("proBadge")}
    </span>
  );
};

export default ProBadge;
