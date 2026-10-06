"use client";
import { useListSeparator } from "@/Components/i18n/navigation";

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
  receiverPhone?: string;
  postalCode?: string;
  // picks the courier: same city as the pharmacy -> Tapsi, else Tipax
  city?: IAddressCity | string;
  location?: { type: "Point"; coordinates?: [number, number] };
}

export type IAddressCity = {
  _id: string;
  name?: string;
  province?: { _id: string; name?: string } | string;
};

export const addressCityLabel = (
  city?: IAddressCity | string,
  sep = "، ",
) => {
  if (!city || typeof city === "string") return "";
  const province =
    city.province && typeof city.province !== "string" ? city.province.name : "";
  return [city.name, province && province !== city.name ? province : ""]
    .filter(Boolean)
    .join(sep);
};

// the address form's city picker (shared by the add popup and the edit page)
export const addressCityField = (title: string) => ({
  type: "nodes" as const,
  title,
  path: `${API}/public/search/city`,
  getOptionLabel: (node: unknown) =>
    addressCityLabel(node as IAddressCity) || (node as IAddressCity)._id,
  getOptionValue: (node: unknown) => (node as IAddressCity)._id,
  // the selector matches the default by id
  getDefaultValue: (node: IUserAddress) =>
    typeof node.city === "string" ? node.city : node.city?._id,
  clearable: true,
  // /public/search/city returns the list itself in `data`
  dataParser: (res: unknown) => {
    const list = (res as { data?: unknown })?.data;
    return Array.isArray(list) ? list : [];
  },
});

// 989121234567 -> 09121234567 (how an Iranian number is read aloud)
export const localPhone = (phone?: string) =>
  phone ? phone.replace(/^98(9\d{9})$/, "0$1") : "";

const POPUP = "DashboardMutateAddress";

const AddressCard = ({ node, mutate }: { node: IUserAddress; mutate: () => unknown }) => {
  const getContent = useScopedLocale(NS);
  const listSep = useListSeparator();
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
        <span className={`${classes.icon} glassIcon`}>
          <Ixon width="1.25rem">
            <LocationIcon />
          </Ixon>
        </span>
        <strong className={classes.name}>{node.displayName || "—"}</strong>
      </div>
      <p className={classes.address}>{node.address}</p>
      {(!!node.receiverPhone || !!node.postalCode || !!addressCityLabel(node.city)) && (
        <p className={classes.meta}>
          {[
            addressCityLabel(node.city, listSep),
            node.receiverPhone ? `${getContent("receiverPhone")}: ${localPhone(node.receiverPhone)}` : "",
            node.postalCode ? `${getContent("postalCode")}: ${node.postalCode}` : "",
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
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
                <span className={`${classes.addIcon} glassIcon tone-violet`}>
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
