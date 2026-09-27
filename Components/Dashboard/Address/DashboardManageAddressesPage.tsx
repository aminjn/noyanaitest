"use client";

import useSWR from "swr";
import { useState } from "react";
import classes from "./DashboardManageAddressesPage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import { MongoDoc } from "@/Components/Hooks/useUser";
import Link from "@/Components/i18n/Link";
import Ixon from "@/Components/UI/Ixon";
import LocationIcon from "@/Components/Icons/LocationIcon";
import MapIcon from "@/Components/Icons/MapIcon";
import EditIcon from "@/Components/Icons/EditIcon";
import TrashIcon from "@/Components/Icons/TrashIcon";
import PlusIcon from "@/Components/Icons/PlusIcon";
import DashboardMutateAddressPopup from "./DashboardMutateAddressPopup";

const NS: ContentNamespace[] = ["common", "dashboardAddress"];

// Mirrors Models/UserAddress.ts on noyanai-back.
export interface IUserAddress extends MongoDoc {
  user: string;
  displayName: string;
  address: string;
  location?: { type: "Point"; coordinates?: [number, number] };
}

const POPUP = "DashboardMutateAddress";

const AddressCard = ({ node, mutate }: { node: IUserAddress; mutate: () => unknown }) => {
  const getContent = useScopedLocale(NS);
  const pushNotification = useNotification();
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const pinned = (node.location?.coordinates?.length || 0) === 2;

  const remove = async () => {
    setBusy(true);
    try {
      await fetcher({ url: `${API}/user/address/${node._id}`, method: "DELETE" });
      pushNotification(getContent("adDeleted"), "Success");
      mutate();
    } catch (e) {
      pushNotification(e instanceof Error ? e.message : String(e), "Error");
      setBusy(false);
      setAsking(false);
    }
  };

  return (
    <li className={classes.card}>
      <div className={classes.top}>
        <span className={classes.icon}>
          <Ixon width="1.25rem">
            <LocationIcon />
          </Ixon>
        </span>
        <strong className={classes.name}>{node.displayName || "—"}</strong>
      </div>
      <p className={classes.address}>{node.address}</p>
      {pinned ? (
        <span className={classes.pinned}>
          <Ixon width="0.875rem">
            <MapIcon />
          </Ixon>
          {getContent("adPinned")}
        </span>
      ) : (
        <Link href={`/dashboard/address/${node._id}?tab=Location`} className={classes.noPin}>
          <Ixon width="0.875rem">
            <MapIcon />
          </Ixon>
          {getContent("adNoPin")} · <b>{getContent("adSetPin")}</b>
        </Link>
      )}
      <div className={classes.bottom}>
        {asking ? (
          <>
            <span className={classes.ask}>{getContent("adDeleteAsk")}</span>
            <button type="button" className={classes.danger} onClick={remove} disabled={busy}>
              {getContent("adDeleteYes")}
            </button>
            <button type="button" className={classes.ghost} onClick={() => setAsking(false)} disabled={busy}>
              {getContent("cancel")}
            </button>
          </>
        ) : (
          <>
            <Link href={`/dashboard/address/${node._id}`} className={classes.ghost}>
              <Ixon width="1rem">
                <EditIcon />
              </Ixon>
              {getContent("adEdit")}
            </Link>
            <button
              type="button"
              className={`${classes.ghost} ${classes.del}`}
              onClick={() => setAsking(true)}
              aria-label={getContent("delete")}
              title={getContent("delete")}
            >
              <Ixon width="1rem">
                <TrashIcon />
              </Ixon>
            </button>
          </>
        )}
      </div>
    </li>
  );
};

// Saved delivery addresses as cards (Snapp / Digikala-style): name, text,
// map-pin state with a shortcut to pin it, edit and delete.
const DashboardManageAddressesPage = () => {
  const { data, error, mutate } = useSWR<IUserAddress[]>(`${API}/user/address`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const getContent = useScopedLocale(NS);
  const { setPopup } = usePopup();
  const list = Array.isArray(data) ? data : [];
  const add = () => setPopup(POPUP, <DashboardMutateAddressPopup mutate={mutate} popupName={POPUP} />);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <header className={classes.header}>
            <h1 className={classes.title}>{getContent("addresses")}</h1>
            <button type="button" className={classes.primary} onClick={add}>
              <Ixon width="1rem">
                <PlusIcon />
              </Ixon>
              {getContent("adNew")}
            </button>
          </header>

          <p className={classes.tip} role="note">
            <Ixon width="1rem">
              <MapIcon />
            </Ixon>
            {getContent("adTip")}
          </p>

          <ul className={classes.grid}>
            {list.map((node) => (
              <AddressCard key={node._id} node={node} mutate={mutate} />
            ))}
            <li>
              <button type="button" className={classes.addCard} onClick={add}>
                <span className={classes.addIcon}>
                  <Ixon width="1.25rem">
                    <PlusIcon />
                  </Ixon>
                </span>
                {list.length ? getContent("adNew") : getContent("adEmpty")}
              </button>
            </li>
          </ul>
        </div>
      )}
    </HandleLoading>
  );
};

export default DashboardManageAddressesPage;
