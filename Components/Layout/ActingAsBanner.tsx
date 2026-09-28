"use client";

import useSWR from "swr";
import classes from "./ActingAsBanner.module.css";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import Link from "@/Components/i18n/Link";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import InitialAvatar from "../UI/InitialAvatar";
import { NodeWithAcl } from "../_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";

const LOCALE_NS: ContentNamespace[] = ["common", "layoutPanel"];

// A secretary inside someone else's panel sees whose panel it is and a way
// back to pick another workplace (same SWR key as useAcl, so no extra call)
const ActingAsBanner = ({ kind, ownerName }: { kind: NodeWithAcl; ownerName?: string }) => {
  const getContent = useScopedLocale(LOCALE_NS);
  const { data } = useSWR<unknown>(`${API}/acl/${kind}`, (url: string) =>
    fetcher({ url }).then((res) => res.data.access),
  );
  if (!data || data === "FULL" || !ownerName) return null;
  return (
    <div className={classes.main} role="status">
      <InitialAvatar name={ownerName} seed={ownerName} size="1.75rem" />
      <span className={classes.text}>{getContent("actingAs", [ownerName])}</span>
      <Link href="/secretarypanel" className={classes.exit}>
        {getContent("actingExit")}
      </Link>
    </div>
  );
};

export default ActingAsBanner;
