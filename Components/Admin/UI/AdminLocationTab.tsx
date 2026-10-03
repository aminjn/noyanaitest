"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import PointPicker from "./PointPicker";
import FormActions from "./FormActions";
import Button from "@/Components/UI/Button";
import AreaInput from "@/Components/UI/AreaInput";
import MultiSelectInputServer from "@/Components/UI/MultiSelectInputServer";
import useForm from "@/Components/Hooks/useForm";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { locate } from "@/Components/Map/nexamap";
import { asPoint } from "@/Components/Map/PointPickerCore";
import { ta } from "@/Components/Admin/i18n/adminText";
import classes from "./AdminLocationTab.module.css";

type Division = { _id: string; name?: string };
type Node = {
  _id: string;
  location?: { coordinates?: [number, number] | number[] };
  address?: unknown;
  province?: unknown;
  city?: unknown;
  district?: unknown;
};

const idOf = (v: unknown) =>
  typeof v === "string"
    ? v
    : v && typeof v === "object" && "_id" in v
      ? String((v as Division)._id)
      : "";
const nameOf = (v: unknown) =>
  v && typeof v === "object" && "name" in v
    ? String((v as Division).name || "")
    : "";

// a saved division's name, when the record only carries its id
const useDivisionName = (
  kind: "province" | "city" | "district",
  value: unknown,
) => {
  const id = idOf(value);
  const known = nameOf(value);
  const { data } = useSWR<string>(
    id && !known ? `${API}/auto/${kind}/${id}` : null,
    (url: string) =>
      fetcher({ url }).then((res) => String(res?.data?.data?.name || "")),
  );
  return known || data || "";
};

// The one place a centre's location is set in the super admin (2026-10):
// the pin, the written address, and the province / city / district the
// pin falls in. The divisions are never typed next to the pin: they come
// from it (NexaMap through /map/locate, our own boundaries when it's off)
// and are saved with it. Only a pin that matches no division asks for them
// by hand. The backend keeps the same rule (Lib/geoFromPoint.ts): a moved
// pin replaces the divisions on record.
const AdminLocationTab = ({
  path,
  node,
  mutate,
  hint,
  withAddress = true,
  withDivisions = true,
}: {
  // the record's save endpoint (POST), e.g. `${API}/auto/pharmacy/<id>`
  path: string;
  node: Node;
  mutate: () => unknown;
  hint?: string;
  withAddress?: boolean;
  // false for a record that keeps no province / city (an insurer's office)
  withDivisions?: boolean;
}) => {
  const savedPoint = asPoint(
    node.location?.coordinates as [number, number] | undefined,
  );
  const savedAddress = typeof node.address === "string" ? node.address : "";
  const [found, setFound] = useState<{
    province?: Division | null;
    city?: Division | null;
    district?: Division | null;
  } | null>(null);
  const [looking, setLooking] = useState(false);
  const [manual, setManual] = useState<{
    province?: Division;
    city?: Division;
    district?: Division;
  }>({});
  const [addressVersion, setAddressVersion] = useState(0);

  const { input, setInput, isLoading, submit } = useForm<{
    coords?: [number, number];
    address?: string;
  }>({
    path,
    method: "POST",
    successCb: () => {
      setFound(null);
      setManual({});
      mutate();
    },
    hasProblem: (inp) =>
      !inp.coords && inp.address === undefined && !manual.province
        ? ta("یک موقعیت را انتخاب کنید")
        : false,
    mutator: (inp) => {
      const divisions = !withDivisions
        ? null
        : found?.province
          ? found
          : manual.province
            ? manual
            : null;
      return {
        ...(inp.coords
          ? { location: { type: "Point", coordinates: inp.coords } }
          : {}),
        ...(withAddress && inp.address !== undefined
          ? { address: inp.address.trim() }
          : {}),
        ...(divisions
          ? {
              province: divisions.province?._id || null,
              city: divisions.city?._id || null,
              district: divisions.district?._id || null,
            }
          : {}),
      };
    },
  });

  // a new pin: what it falls in, and its address for an empty address box
  const coords = input.coords;
  useEffect(() => {
    if (!coords) return;
    let alive = true;
    setLooking(true);
    locate({ lng: coords[0], lat: coords[1] })
      .then((res) => {
        if (!alive) return;
        setFound({
          province: res.province,
          city: res.city,
          district: res.district,
        });
        setManual({});
        if (withAddress && res.address)
          setInput((prev) => {
            if ((prev.address ?? savedAddress).trim()) return prev;
            setAddressVersion((v) => v + 1);
            return { ...prev, address: res.address || undefined };
          });
      })
      .catch(
        () => alive && setFound({ province: null, city: null, district: null }),
      )
      .finally(() => alive && setLooking(false));
    return () => {
      alive = false;
    };
  }, [coords, withAddress, savedAddress, setInput]);

  const savedProvince = useDivisionName("province", node.province);
  const savedCity = useDivisionName("city", node.city);
  const savedDistrict = useDivisionName("district", node.district);
  const shown = found
    ? [found.province?.name, found.city?.name, found.district?.name]
    : [savedProvince, savedCity, savedDistrict];
  // the pin matched nothing (or there is no pin and nothing on record)
  const unmatched =
    withDivisions &&
    ((found && !found.province) ||
      (!found && !savedPoint && !idOf(node.province)));
  const currentAddress = input.address ?? savedAddress;
  const changed =
    !!input.coords || input.address !== undefined || !!manual.province;

  return (
    <div className={classes.main}>
      <p className={classes.hint}>
        {hint ||
          (withDivisions
            ? ta(
                "محل را روی نقشه انتخاب کنید؛ استان، شهر و محله از همین نقطه تعیین می‌شوند.",
              )
            : ta("محل را روی نقشه انتخاب کنید."))}
      </p>
      <PointPicker
        defaultValue={savedPoint || undefined}
        onChange={(e) => setInput((prev) => ({ ...prev, coords: e }))}
        currentAddress={withAddress ? currentAddress : undefined}
        onUseAddress={
          withAddress
            ? (address) => {
                setInput((prev) => ({ ...prev, address }));
                setAddressVersion((v) => v + 1);
              }
            : undefined
        }
      />
      {withDivisions && (
        <div className={classes.divisions} aria-live="polite">
          <span className={classes.label}>{ta("استان، شهر و محله")}</span>
          {looking ? (
            <span className={classes.muted}>{ta("در حال یافتن…")}</span>
          ) : shown.some(Boolean) && !unmatched ? (
            <span className={classes.value}>
              {shown.filter(Boolean).join(" / ")}
            </span>
          ) : (
            <span className={classes.muted}>
              {ta("از روی نقشه تعیین می‌شود")}
            </span>
          )}
        </div>
      )}
      {unmatched && (found || !savedPoint) && (
        <div className={classes.manual}>
          <p className={classes.muted}>
            {found
              ? ta(
                  "این نقطه با هیچ استان و شهری در سامانه جور نشد؛ آن‌ها را دستی انتخاب کنید یا مرز تقسیمات را در «استان‌ها» همگام کنید.",
                )
              : ta(
                  "تا موقعیتی ثبت نشده، استان و شهر را می‌توانید دستی انتخاب کنید.",
                )}
          </p>
          <MultiSelectInputServer<Division>
            multi={false}
            value={manual.province ? [manual.province] : []}
            placeholder={ta("استان")}
            path={`${API}/auto/province`}
            getOption={(n) => ({ title: n.name || n._id, value: n._id })}
            onChange={(e) => setManual({ province: e[0] })}
          />
          {!!manual.province && (
            <MultiSelectInputServer<Division>
              multi={false}
              value={manual.city ? [manual.city] : []}
              placeholder={ta("شهر")}
              path={`${API}/auto/city?province=${manual.province._id}`}
              getOption={(n) => ({ title: n.name || n._id, value: n._id })}
              onChange={(e) =>
                setManual((p) => ({ province: p.province, city: e[0] }))
              }
            />
          )}
          {!!manual.city && (
            <MultiSelectInputServer<Division>
              multi={false}
              value={manual.district ? [manual.district] : []}
              placeholder={ta("محله")}
              path={`${API}/auto/district?city=${manual.city._id}`}
              getOption={(n) => ({ title: n.name || n._id, value: n._id })}
              onChange={(e) => setManual((p) => ({ ...p, district: e[0] }))}
            />
          )}
        </div>
      )}
      {withAddress && (
        <AreaInput
          key={addressVersion}
          title={ta("آدرس")}
          defaultValue={currentAddress}
          onChange={(e) => {
            const address = e.target.value;
            setInput((prev) => ({ ...prev, address }));
          }}
        />
      )}
      <FormActions>
        <Button
          isLoading={isLoading}
          variant={changed ? "Primary" : "Disable"}
          onClick={changed ? submit : undefined}
        >
          {ta("ذخیره موقعیت")}
        </Button>
      </FormActions>
    </div>
  );
};

export default AdminLocationTab;
