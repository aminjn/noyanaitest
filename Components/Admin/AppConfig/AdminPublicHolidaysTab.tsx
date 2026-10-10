"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { TEHRAN_TZ, tehranNoon, tehranTodayYmd } from "@/Components/helpers/tehranTime";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import PopupCard from "@/Components/UI/PopupCard";
import { MongoDoc } from "@/Components/Hooks/useUser";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table, { TableRenderer } from "../UI/Table";
import CreateForm, { FormRenderer } from "../UI/CreateForm";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import ToggleInput from "@/Components/UI/ToggleInput";
import { adminIntlTag, ta } from "@/Components/Admin/i18n/adminText";
import classes from "./AdminPublicHolidaysTab.module.css";

// «تعطیلات رسمی» (2026-10): Iran's official holidays, one tab of the booking
// settings (backend Models/PublicHoliday.ts, the /auto/publicHoliday
// segment). The fixed solar days and the official lunar days are seeded at
// boot; the admin adds next year's lunar days once the official calendar
// (University of Tehran Geophysics Institute) is out, fixes a title or a
// day, or switches one off. A doctor is closed on an active holiday unless
// they chose to work (doctor panel → hours). Never deleted: a seeded day
// would come back.
export interface IPublicHoliday extends MongoDoc {
  ymd: string;
  title: string;
  kind?: "solar" | "lunar" | "custom";
  active?: boolean;
  seedKey?: string;
}

type HolidayInput = { date?: string; title?: string; active?: boolean };

const YMD = /^\d{4}-\d{2}-\d{2}$/;

// the Iranian (solar Hijri) year of a Tehran day, whatever the admin's language
const jalaliYear = (() => {
  let fmt: Intl.DateTimeFormat | null = null;
  return (ymd: string) => {
    try {
      fmt = fmt || new Intl.DateTimeFormat("en-u-ca-persian-nu-latn", { timeZone: TEHRAN_TZ, year: "numeric" });
      return parseInt(fmt.format(tehranNoon(ymd)), 10) || 0;
    } catch {
      return Number(ymd.slice(0, 4)) - 621;
    }
  };
})();

const kindLabel = (kind?: string) =>
  kind === "solar" ? ta("خورشیدی (ثابت)") : kind === "lunar" ? ta("قمری") : ta("دستی");

const formFields = (): FormRenderer<HolidayInput> => ({
  date: { type: "date", title: ta("روز"), required: true },
  title: { type: "text", title: ta("عنوان"), required: true },
  active: { type: "bool", title: ta("فعال") },
});

const HolidayPopup = ({ node, mutate }: { node?: IPublicHoliday; mutate: () => unknown }) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard title={node ? ta("ویرایش تعطیل رسمی") : ta("تعطیل رسمی جدید")}>
      <p className={classes.popupHint}>{ta("یک روز تقویم تهران؛ برای روزی با دو مناسبت، هر دو را در عنوان بنویسید.")}</p>
      <CreateForm<HolidayInput>
        defaultValue={node ? { date: node.ymd, title: node.title, active: node.active !== false } : { active: true }}
        renderer={formFields()}
        onCancel={() => closePopup()}
        hookProps={{
          path: node ? `${API}/auto/publicHoliday/${node._id}` : `${API}/auto/publicHoliday`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
      />
    </PopupCard>
  );
};

const AdminPublicHolidaysTab = () => {
  const { data, error, mutate } = useSWR<IPublicHoliday[]>(`${API}/auto/publicHoliday`, (url: string) =>
    fetcher({ url }).then((res) =>
      (Array.isArray(res?.data?.data) ? res.data.data : []).filter(
        (h: IPublicHoliday) => !!h && typeof h.ymd === "string" && YMD.test(h.ymd),
      ),
    ),
  );
  const { setPopup } = usePopup();
  const pushNotification = useNotification();
  const tag = adminIntlTag();
  const fmt = useMemo(
    () => new Intl.DateTimeFormat(tag, { timeZone: TEHRAN_TZ, weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    [tag],
  );
  const num = useMemo(() => new Intl.NumberFormat(tag, { useGrouping: false }), [tag]);

  const list = useMemo(() => [...(data || [])].sort((a, b) => a.ymd.localeCompare(b.ymd)), [data]);
  const years = useMemo(() => Array.from(new Set(list.map((h) => jalaliYear(h.ymd)))).sort(), [list]);
  const thisYear = jalaliYear(tehranTodayYmd());
  const [year, setYear] = useState<number | null>(null);
  const shownYear = year ?? (years.includes(thisYear) ? thisYear : years[years.length - 1] ?? thisYear);
  const rows = list.filter((h) => jalaliYear(h.ymd) === shownYear);
  const today = tehranTodayYmd();

  const open = (node?: IPublicHoliday) =>
    setPopup("PublicHoliday", <HolidayPopup node={node} mutate={mutate} />);

  const setActive = async (node: IPublicHoliday) => {
    try {
      await fetcher({
        url: `${API}/auto/publicHoliday/${node._id}`,
        method: "POST",
        bodyParser: "JSON",
        payload: { active: node.active === false },
      });
      mutate();
    } catch (err) {
      pushNotification((err as Error)?.message || "", "Error");
    }
  };

  const renderer: TableRenderer<IPublicHoliday> = {
    ymd: {
      name: ta("روز"),
      value: (h) => fmt.format(tehranNoon(h.ymd)),
      component: (h) => (
        <span className={h.ymd < today ? classes.past : ""}>{fmt.format(tehranNoon(h.ymd))}</span>
      ),
      filter: "Text",
    },
    title: { name: ta("عنوان"), value: (h) => h.title || "—", filter: "Text" },
    kind: { name: ta("نوع"), value: (h) => kindLabel(h.kind), filter: "Set" },
    active: {
      name: ta("فعال"),
      value: (h) => (h.active === false ? ta("غیرفعال") : ta("فعال")),
      component: (h) => <ToggleInput value={h.active !== false} onChange={() => setActive(h)} />,
      filter: "Set",
    },
    actions: {
      name: ta("عملیات"),
      component: (h) => (
        <TableActions>
          <IconButton title={ta("ویرایش")} onClick={() => open(h)}>
            <EditIcon />
          </IconButton>
        </TableActions>
      ),
    },
  };

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("تعطیلات رسمی")} actions={[{ title: ta("جدید"), action: () => open() }]}>
          <p className={classes.hint}>
            {ta(
              "پزشک در روز تعطیل رسمی فعال نوبت نمی‌دهد، مگر خودش «ویزیت دارم» را انتخاب کند. تعطیلات قمری هر سال را پس از انتشار تقویم رسمی (مؤسسه ژئوفیزیک دانشگاه تهران) اضافه کنید.",
            )}
          </p>
          <div className={classes.years} role="tablist" aria-label={ta("سال")}>
            {(years.includes(thisYear) ? years : [...years, thisYear].sort()).map((y) => (
              <button
                key={y}
                type="button"
                role="tab"
                aria-selected={y === shownYear}
                className={`${classes.year} ${y === shownYear ? classes.yearOn : ""}`}
                onClick={() => setYear(y)}
              >
                {num.format(y)}
                <span>{num.format(list.filter((h) => jalaliYear(h.ymd) === y && h.active !== false).length)}</span>
              </button>
            ))}
          </div>
          {rows.length ? (
            <Table name="AdminPublicHolidays" data={rows} renderer={renderer} />
          ) : (
            <p className={classes.empty}>{ta("برای این سال تعطیلی ثبت نشده است.")}</p>
          )}
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminPublicHolidaysTab;
