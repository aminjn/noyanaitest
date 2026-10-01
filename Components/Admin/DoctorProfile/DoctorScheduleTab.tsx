"use client";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminPath } from "@/Components/helpers/adminPath";
import HandleLoading from "../UI/HandleLoading";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import BooleanToIcon from "@/Components/UI/BooleanToIcon";
import { CentreSection, CentreSections } from "../Clinic/CentreSections";
import { displayPhone } from "../User/userShared";
import {
  adminDateTimeFormat,
  adminNumberFormat,
  ta,
} from "@/Components/Admin/i18n/adminText";
import classes from "./DoctorScheduleTab.module.css";

// «برنامه و دسترسی» (2026-10 admin audit P3-19): everything that decides
// whether a patient can book this doctor, read-only, so support can answer
// "why can't I book?" without opening the doctor's panel - the blockers
// first, then session types, offices, weekly shifts, the next 14 days and
// the secretaries. Backend: GET /admin/doctorprofile/<id>/schedule
// (Controllers/adminProviderController.ts getDoctorSchedule).

type Blocker = { key: string; text: string };
type SessionSetting = {
  type: string;
  exists: boolean;
  active: boolean;
  price: number | null;
  bookable: boolean;
  shiftCount: number;
};
type Office = {
  _id: string;
  name: string;
  address: string;
  tel: string;
  active: boolean;
  centre: { kind: "clinic" | "hospital"; _id: string; name: string } | null;
};
type Shift = {
  _id: string;
  name: string;
  day: number;
  start: number;
  end: number;
  duration: number;
  gap: number;
  sessionTypes: string[];
  patientTypes: string[];
  office: { _id: string; name: string; active: boolean } | null;
  slots: number;
};
type Day = {
  date: string;
  weekday: number;
  shifts: number;
  totalSlots: number;
  freeSlots: number;
  booked: number;
  publishedSlots: number;
};
type SecretaryRow = {
  _id: string;
  displayName: string;
  phone: string;
  username: string;
  userId: string | null;
  userStatus: string;
  acl: string;
};
type Schedule = {
  doctor: {
    _id: string;
    name: string;
    active: boolean;
    claimed: boolean;
    status: string;
    statusReason?: string;
    hasOwner: boolean;
  };
  blockers: Blocker[];
  settings: SessionSetting[];
  offices: Office[];
  shifts: Shift[];
  days: Day[];
  secretaries: SecretaryRow[];
  pendingSecretaries: number;
  license: { displayName: string; expiresAt: string | null; isExpired: boolean } | null;
};

const sessionTypeLabels: Record<string, string> = {
  get inPerson() {
    return ta("حضوری");
  },
  get textChat() {
    return ta("گفتگوی متنی");
  },
  get sipCall() {
    return ta("تماس تلفنی");
  },
  get voiceCall() {
    return ta("تماس صوتی");
  },
  get videoCall() {
    return ta("تماس تصویری");
  },
  get phone() {
    return ta("تلفنی");
  },
};

// DoctorShift.day: 0 = Saturday (backend saturdayBasedDay)
const weekdayLabels = [
  () => ta("شنبه"),
  () => ta("یکشنبه"),
  () => ta("دوشنبه"),
  () => ta("سه‌شنبه"),
  () => ta("چهارشنبه"),
  () => ta("پنجشنبه"),
  () => ta("جمعه"),
];
const weekday = (day: number) => weekdayLabels[day]?.() ?? String(day);

// the backend's blocker keys (getDoctorSchedule); its Persian text is the
// fallback for a key this page doesn't know yet
const blockerText = (b: Blocker, reason: string): string => {
  switch (b.key) {
    case "suspended":
      return reason ? ta("پروفایل تعلیق شده است: ${1}", [reason]) : ta("پروفایل تعلیق شده است");
    case "inactive":
      return ta("پروفایل منتشر نشده (پیش‌نویس) است");
    case "unclaimed":
      return ta("پروفایل ادعانشده (از فهرست قدیمی) است و نوبت نمی‌گیرد");
    case "noOwner":
      return ta("پروفایل مالک پنل ندارد؛ درآمد نوبت به کسی پرداخت نمی‌شود");
    case "noShifts":
      return ta("هیچ شیفتی تعریف نشده است");
    case "noSessionType":
      return ta("هیچ نوع ویزیتی فعال و قیمت‌دار نیست");
    case "noShiftForType":
      return ta("نوع ویزیت فعال در هیچ شیفتی نیست");
    case "inactiveOffice":
      return ta("بعضی شیفت‌ها در مطبی غیرفعال هستند");
    case "fullyBooked":
      return ta("در ۱۴ روز آینده نوبت خالی نیست");
    case "notPublished":
      return ta("نوبت خالی هست اما در صفحه‌ی نوبت‌دهی منتشر نشده؛ پزشک باید شیفت‌ها را یک بار ذخیره کند");
    default:
      return b.text || b.key;
  }
};

const num = adminNumberFormat();
const two = adminNumberFormat({ minimumIntegerDigits: 2, useGrouping: false });
const dayFormat = adminDateTimeFormat({ weekday: "short", month: "short", day: "numeric" });
const dateFormat = adminDateTimeFormat({ year: "numeric", month: "long", day: "numeric" });

const clock = (minutes: number) =>
  Number.isFinite(minutes)
    ? `${two.format(Math.floor(minutes / 60))}:${two.format(minutes % 60)}`
    : "—";
const safeDate = (value: string | null | undefined, format = dateFormat) => {
  if (!value) return "—";
  const date = new Date(value);
  return isNaN(date.getTime()) ? "—" : format.format(date);
};
const list = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const DoctorScheduleTab = ({ nodeId }: { nodeId: string }) => {
  const { data, error } = useSWR<Schedule>(
    nodeId ? `${API}/admin/doctorprofile/${nodeId}/schedule` : null,
    (url: string) => fetcher({ url }).then((res) => res?.data?.data),
  );

  const blockers = list<Blocker>(data?.blockers);
  const settings = list<SessionSetting>(data?.settings);
  const offices = list<Office>(data?.offices);
  const shifts = list<Shift>(data?.shifts);
  const days = list<Day>(data?.days);
  const secretaries = list<SecretaryRow>(data?.secretaries);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <CentreSections>
          <CentreSection
            title={ta("وضعیت نوبت‌دهی")}
            hint={ta("دلیل‌هایی که بیمار نمی‌تواند از سایت نوبت بگیرد، از مهم‌ترین.")}
          >
            {blockers.length ? (
              <ul className={classes.blockers}>
                {blockers.map((b) => (
                  <li key={b.key} className={classes.blocker}>
                    {blockerText(b, data.doctor?.statusReason || "")}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={classes.ok}>
                {ta("مانعی پیدا نشد: پروفایل منتشرشده است و نوبت خالی در صفحه‌ی نوبت‌دهی هست.")}
              </p>
            )}
            {!!data.license && (
              <p className={classes.meta}>
                {data.license.isExpired
                  ? ta("مجوز «${1}» در ${2} تمام شده است", [
                      data.license.displayName || "—",
                      safeDate(data.license.expiresAt),
                    ])
                  : ta("مجوز «${1}» تا ${2}", [
                      data.license.displayName || "—",
                      data.license.expiresAt ? safeDate(data.license.expiresAt) : ta("بدون پایان"),
                    ])}
              </p>
            )}
          </CentreSection>

          <CentreSection
            title={ta("نوع‌های ویزیت")}
            hint={ta("نوعی نوبت‌پذیر است که فعال باشد، قیمت داشته باشد و دست‌کم در یک شیفت آمده باشد.")}
          >
            <Table
              name="AdminDoctorScheduleSettings"
              exportable={false}
              data={settings}
              renderer={{
                type: {
                  name: ta("نوع ویزیت"),
                  value: (row) => sessionTypeLabels[row.type] || row.type,
                },
                active: {
                  name: ta("فعال"),
                  component: (row) => <BooleanToIcon value={row.active} />,
                  value: (row) => (row.active ? ta("بله") : ta("خیر")),
                },
                price: {
                  name: ta("قیمت (تومان)"),
                  value: (row) => (row.price == null ? "—" : num.format(row.price)),
                },
                shiftCount: {
                  name: ta("در شیفت‌ها"),
                  value: (row) => num.format(row.shiftCount || 0),
                },
                bookable: {
                  name: ta("نوبت‌پذیر"),
                  component: (row) => (
                    <BooleanToIcon value={row.bookable && row.shiftCount > 0} />
                  ),
                  value: (row) => (row.bookable && row.shiftCount > 0 ? ta("بله") : ta("خیر")),
                },
              }}
            />
          </CentreSection>

          <CentreSection title={ta("۱۴ روز آینده")} hint={ta("نوبت‌های خالی از روی شیفت‌ها، و آنچه صفحه‌ی نوبت‌دهی به بیمار نشان می‌دهد.")}>
            <Table
              name="AdminDoctorScheduleDays"
              exportable={false}
              data={days}
              renderer={{
                date: {
                  name: ta("روز"),
                  value: (row) => safeDate(row.date, dayFormat),
                },
                shifts: { name: ta("شیفت"), value: (row) => num.format(row.shifts || 0) },
                totalSlots: { name: ta("کل نوبت‌ها"), value: (row) => num.format(row.totalSlots || 0) },
                booked: { name: ta("رزروشده"), value: (row) => num.format(row.booked || 0) },
                freeSlots: { name: ta("خالی"), value: (row) => num.format(row.freeSlots || 0) },
                publishedSlots: {
                  name: ta("در صفحه‌ی نوبت‌دهی"),
                  value: (row) => num.format(row.publishedSlots || 0),
                },
              }}
            />
          </CentreSection>

          <CentreSection title={ta("شیفت‌های هفتگی")}>
            {shifts.length ? (
              <Table
                name="AdminDoctorScheduleShifts"
                exportable={false}
                data={shifts}
                renderer={{
                  day: { name: ta("روز هفته"), value: (row) => weekday(row.day) },
                  time: {
                    name: ta("ساعت"),
                    value: (row) => `${clock(row.start)} – ${clock(row.end)}`,
                  },
                  duration: {
                    name: ta("هر نوبت (دقیقه)"),
                    value: (row) => num.format(row.duration || 0),
                  },
                  slots: { name: ta("تعداد نوبت"), value: (row) => num.format(row.slots || 0) },
                  sessionTypes: {
                    name: ta("نوع ویزیت"),
                    value: (row) =>
                      list<string>(row.sessionTypes)
                        .map((t) => sessionTypeLabels[t] || t)
                        .join("، ") || "—",
                  },
                  office: {
                    name: ta("مطب"),
                    value: (row) =>
                      row.office
                        ? `${row.office.name || ta("بدون نام")}${row.office.active ? "" : ` (${ta("غیرفعال")})`}`
                        : "—",
                  },
                }}
              />
            ) : (
              <p className={classes.meta}>{ta("شیفتی تعریف نشده است.")}</p>
            )}
          </CentreSection>

          <CentreSection title={ta("مطب‌ها")}>
            {offices.length ? (
              <ul className={classes.rows}>
                {offices.map((office) => (
                  <li key={office._id} className={classes.row}>
                    <span className={classes.rowTitle}>{office.name || ta("بدون نام")}</span>
                    <BooleanToIcon value={office.active} />
                    {!!office.centre && (
                      <InlineLink href={adminPath(`/${office.centre.kind}/${office.centre._id}`)}>
                        {office.centre.name}
                      </InlineLink>
                    )}
                    {!!office.address && <span className={classes.meta}>{office.address}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={classes.meta}>{ta("مطبی ثبت نشده است.")}</p>
            )}
          </CentreSection>

          <CentreSection
            title={ta("منشی‌ها")}
            hint={
              data.pendingSecretaries
                ? ta("${1} دعوت منشی در انتظار پاسخ است.", [num.format(data.pendingSecretaries)])
                : undefined
            }
          >
            {secretaries.length ? (
              <ul className={classes.rows}>
                {secretaries.map((row) => (
                  <li key={row._id} className={classes.row}>
                    {row.userId ? (
                      <InlineLink href={adminPath(`/user/${row.userId}`)}>
                        {row.displayName || row.username || displayPhone(row.phone) || "—"}
                      </InlineLink>
                    ) : (
                      <span className={classes.rowTitle}>{row.displayName || "—"}</span>
                    )}
                    {!!row.phone && <span className={classes.meta}>{displayPhone(row.phone)}</span>}
                    {!!row.acl && <span className={classes.meta}>{ta("دسترسی: ${1}", [row.acl])}</span>}
                    {row.userStatus === "suspended" && (
                      <span className={classes.warn}>{ta("حساب معلق")}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={classes.meta}>{ta("منشی‌ای ندارد.")}</p>
            )}
          </CentreSection>
        </CentreSections>
      )}
    </HandleLoading>
  );
};

export default DoctorScheduleTab;
