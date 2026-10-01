"use client";

import { useEffect, useRef, useState } from "react";
import LocationPicker from "@/Components/Map/LocationPicker";
import { locate, LocatedPoint } from "@/Components/Map/nexamap";
import Input from "@/Components/UI/Input";
import Button from "@/Components/UI/Button";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { IUserAddress } from "./DashboardManageAddressesPage";
import classes from "./AddressForm.module.css";

const NS: ContentNamespace[] = ["common", "dashboardAddress", "mapPage"];

type Ref = { _id: string; name?: string } | string | undefined | null;
const refName = (v: Ref) => (v && typeof v === "object" ? v.name || "" : "");
const refId = (v: Ref) => (v ? (typeof v === "object" ? v._id : v) : "");

// Add or edit an address the way Snapp / Digikala do (2026-10): the pin
// first, then everything the map knows fills itself - written address,
// province, city, neighbourhood (NexaMap through /map/locate, our own
// boundaries when it's off) - and the person only types what a map can't
// know: plaque, unit, postal code. Province and city are always set (the
// server derives them from the pin and refuses an address without them).
const AddressForm = ({
  address,
  onSaved,
  onCancel,
}: {
  address?: IUserAddress & {
    province?: Ref;
    district?: Ref;
    plaque?: string;
    unit?: string;
  };
  onSaved: (id?: string) => unknown;
  onCancel?: () => unknown;
}) => {
  const getContent = useScopedLocale(NS);
  const pushNotification = useNotification();
  const saved = address?.location?.coordinates;
  const [point, setPoint] = useState<[number, number] | null>(
    Array.isArray(saved) && saved.length === 2 ? (saved as [number, number]) : null,
  );
  const [located, setLocated] = useState<LocatedPoint | null>(null);
  const [locating, setLocating] = useState(false);
  const [form, setForm] = useState({
    address: address?.address || "",
    plaque: address?.plaque || "",
    unit: address?.unit || "",
    postalCode: address?.postalCode || "",
    receiverPhone: address?.receiverPhone || "",
    displayName: address?.displayName || "",
  });
  // the written address follows the pin until the person edits it
  const addressTouched = useRef(!!address?.address);
  const [busy, setBusy] = useState(false);
  const moved = useRef(false);

  useEffect(() => {
    if (!point || !moved.current) return;
    let alive = true;
    setLocating(true);
    const timer = setTimeout(() => {
      locate({ lng: point[0], lat: point[1] })
        .then((res) => {
          if (!alive) return;
          setLocated(res);
          setForm((prev) => ({
            ...prev,
            address: addressTouched.current ? prev.address : res.address || prev.address,
            postalCode: prev.postalCode || res.postalCode || "",
          }));
        })
        .catch(() => alive && setLocated(null))
        .finally(() => alive && setLocating(false));
    }, 300);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [point]);

  const province = located?.province?.name || (!moved.current ? refName(address?.province) : "");
  const city =
    located?.city?.name ||
    (!moved.current ? refName(address?.city as Ref) : "");
  const district = located?.district?.name || (!moved.current ? refName(address?.district) : "");
  const cityKnown = !!(located?.city || (!moved.current && refId(address?.city as Ref)));

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => {
    if (key === "address") addressTouched.current = true;
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const postalOk = /^\d{10}$/.test(form.postalCode.replace(/\D/g, "").replace(/[۰-۹]/g, ""));
  const digits = (v: string) => v.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/\D/g, "");

  const submit = async () => {
    if (!point) return pushNotification(getContent("addressPinFirst"), "Warn");
    if (!cityKnown && !locating) return pushNotification(getContent("addressCityNotFound"), "Warn");
    if (!form.address.trim()) return pushNotification(getContent("addressWriteIt"), "Warn");
    if (digits(form.postalCode).length !== 10) return pushNotification(getContent("addressPostalCode10"), "Warn");
    setBusy(true);
    try {
      const res = (await fetcher({
        url: address ? `${API}/user/address/${address._id}` : `${API}/user/address`,
        method: "POST",
        bodyParser: "JSON",
        payload: {
          ...(moved.current || !address ? { location: point } : {}),
          address: form.address.trim(),
          plaque: form.plaque.trim() || undefined,
          unit: form.unit.trim() || undefined,
          postalCode: digits(form.postalCode),
          ...(form.receiverPhone.trim() ? { receiverPhone: form.receiverPhone.trim() } : {}),
          ...(form.displayName.trim() ? { displayName: form.displayName.trim() } : {}),
        },
      })) as { data?: { data?: { _id?: string } } };
      pushNotification(getContent("addressSaved"), "Success");
      onSaved(res?.data?.data?._id);
    } catch (err) {
      pushNotification((err as Error).message, "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={classes.main}>
      <LocationPicker
        compact
        defaultValue={point || undefined}
        hint={getContent("addressPinFirst")}
        onChange={(p) => {
          moved.current = true;
          setPoint(p);
        }}
      />

      {point && (
        <div className={classes.detected} aria-live="polite">
          {locating ? (
            <span className={classes.muted}>{getContent("mapFindingAddress")}</span>
          ) : (
            <>
              <div className={classes.chips}>
                <span className={`${classes.chip} ${province ? "" : classes.missing}`}>
                  <small>{getContent("addressProvince")}</small>
                  {province || "—"}
                </span>
                <span className={`${classes.chip} ${city ? "" : classes.missing}`}>
                  <small>{getContent("addressCity")}</small>
                  {city || "—"}
                </span>
                <span className={classes.chip}>
                  <small>{getContent("addressDistrict")}</small>
                  {district || "—"}
                </span>
              </div>
              {located?.trafficZone && (
                <span className={classes.zone}>{getContent("mapTrafficZone")}</span>
              )}
              {moved.current && !cityKnown && (
                <span className={classes.warn}>{getContent("addressCityNotFound")}</span>
              )}
            </>
          )}
        </div>
      )}

      <div className={classes.fields}>
        <label className={classes.wide}>
          <span>{getContent("address")}</span>
          <textarea rows={2} value={form.address} onChange={set("address")} />
        </label>
        <Input title={getContent("addressPlaque")} defaultValue={form.plaque} onChange={set("plaque")} />
        <Input title={getContent("addressUnit")} defaultValue={form.unit} onChange={set("unit")} />
        <Input
          // remounts when the map supplies a postal code
          key={`postal-${located?.postalCode || ""}`}
          title={getContent("postalCode")}
          defaultValue={form.postalCode}
          onChange={set("postalCode")}
          inputMode="numeric"
          required
        />
        <Input
          title={getContent("receiverPhone")}
          defaultValue={form.receiverPhone}
          onChange={set("receiverPhone")}
          inputMode="tel"
        />
        <Input
          className={classes.wide}
          title={getContent("displayName")}
          defaultValue={form.displayName}
          onChange={set("displayName")}
        />
      </div>
      {!postalOk && form.postalCode && (
        <span className={classes.warn}>{getContent("addressPostalCode10")}</span>
      )}

      <div className={classes.actions}>
        <Button onClick={submit} isLoading={busy} variant={point && !locating ? "Primary" : "Disable"}>
          {getContent("submit")}
        </Button>
        {onCancel && (
          <Button variant="Neutral" onClick={() => onCancel()}>
            {getContent("cancel")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default AddressForm;
