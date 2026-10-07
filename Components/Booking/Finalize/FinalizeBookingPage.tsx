"use client";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import useSWR from "swr";
import classes from "./FinalizeBookingPage.module.css";
import TehranTimeHint from "@/Components/Booking/TehranTimeHint";
import {
  diffDaysYmd,
  isYmd,
  TEHRAN_TZ,
  tehranMinutesOfDay,
  tehranNoon,
  tehranTodayYmd,
} from "@/Components/helpers/tehranTime";
import { useIntlLocale, usePathname, useRouter } from "@/Components/i18n/navigation";
import { API } from "@/Components/config";
import { fetcher, FetchError } from "@/Components/helpers/fetcher";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import { IDoctorShift } from "@/Components/DoctorPanel/Shift/DoctorManageShiftsPage";
import { getDoctorProfileLabel } from "@/Components/Admin/Lib/LabelGetters";
import HostedImage from "@/Components/UI/HostedImage";
import InitialAvatar from "@/Components/UI/InitialAvatar";
import Ixon from "@/Components/UI/Ixon";
import Button from "@/Components/UI/Button";
import Input from "@/Components/UI/Input";
import DateInput from "@/Components/UI/DateInput";
import BottomSheet from "@/Components/UI/BottomSheet";
import Link from "@/Components/i18n/Link";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useSiteSettings from "@/Components/Hooks/useSiteSettings";
import useNotification from "@/Components/Hooks/useNotification";
import useProgress from "@/Components/Hooks/useProgress";
import useUser, { IUser, MongoDoc, UserPopulation } from "@/Components/Hooks/useUser";
import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { IUserIdentity } from "@/Components/Dashboard/DashboardPage";
import IdentityVerifyForm from "@/Components/_Common/Identity/IdentityVerifyForm";
import WalletShortfallTopUp from "@/Components/Payment/WalletShortfallTopUp";
import WalletChargeAct from "@/Components/Payment/WalletChargeAct";
import { usePaymentConfig } from "@/Components/Payment/paymentTypes";
import ProUpsellCard from "@/Components/Pro/ProUpsellCard";
import LeaveByHint from "@/Components/Map/LeaveByHint";
import {
  DoctorSessionType,
  doctorSessionTypeContentKeyDict,
} from "@/Components/DoctorPanel/Calendar/DoctorCalendarDay";
import { DoctorConfig } from "@/Components/Dr/PublicDrSessions";
import CheckIcon from "@/Components/Icons/CheckIcon";
import PlusIcon from "@/Components/Icons/PlusIcon";
import WalletIcon from "@/Components/Icons/WalletIcon";
import HospitalIcon from "@/Components/Icons/HospitalIcon";
import ShieldCheckIcon from "@/Components/Icons/ShieldCheckIcon";
import TagIcon from "@/Components/Icons/TagIcon";
import UserIcon from "@/Components/Icons/UserIcon";
import MedicalRecordIcon from "@/Components/Icons/MedicalRecordIcon";
import LockIcon from "@/Components/Icons/LockIcon";
import AlertTriangleIcon from "@/Components/Icons/AlertTriangleIcon";
import Calendar02Icon from "@/Components/Icons/Calendar02Icon";
import LocationIcon from "@/Components/Icons/LocationIcon";
import EditIcon from "@/Components/Icons/EditIcon";
import SlotPicker, { SlotPick } from "../Flow/SlotPicker";
import BookingSteps from "../Flow/BookingSteps";
import InlineLogin from "../Flow/InlineLogin";
import { OfficePicker, visitTypeIcon, visitTypeTone, VisitTypePicker } from "../Flow/BookingChoices";
import { BookingQuote, clock, InsuranceOption, InsurancePick, useBookableSlots, visitTypeOrder } from "../Flow/bookingFlow";
import { IReservation } from "@/Components/Dashboard/Booking/DashboardManageBookingsPage";

const NS: ContentNamespace[] = ["common", "bookingFinalize", "bookingFlow"];

type FinalizeBookingDoctor = IDoctorProfile<{
  Shifts: { Office: Record<never, never> };
  MainSpecialityPopulated: Record<never, never>;
  SipCallSettings: Record<never, never>;
  InPersonSettings: Record<never, never>;
  TextChatSettings: Record<never, never>;
  VideoCallSettings: Record<never, never>;
  VoiceCallSettings: Record<never, never>;
}> & {
  // the effective visit tax (publicController.getDoctorProfileById)
  visitTaxPercent?: number;
  officeTaxPercents?: Record<string, number>;
};

// the wallet as the API returns it (shared by the cart, transactions,
// license checkout and Pro pages)
export type WalletPopulation = Population<{ User: UserPopulation }>;
export interface IWallet<T extends WalletPopulation = WalletPopulation> extends MongoDoc {
  user: T["User"] extends UserPopulation ? IUser<T["User"]> : string;
  balance: number;
}

const onsets = ["today", "days", "week", "month", "longer"] as const;
type Onset = (typeof onsets)[number];
const onsetKey: Record<Onset, ContentKey> = {
  today: "bfOnsetToday",
  days: "bfOnsetDays",
  week: "bfOnsetWeek",
  month: "bfOnsetMonth",
  longer: "bfOnsetLonger",
};

type Method = "wallet" | "gateway" | "desk";

// what the patient filled in, kept while they top up at the gateway
type Draft = {
  patient?: string;
  complaint?: string;
  onset?: Onset | null;
  // (older drafts) one insurance
  insurance?: string | null;
  // the insurances picked, basic first (undefined: not chosen yet - the
  // patient's saved ones are preselected)
  insurances?: InsurancePick[];
  code?: string;
  method?: Method;
};
const draftKey = (doctor: string) => `noyan-booking-${doctor}`;
const readDraft = (doctor: string): Draft => {
  try {
    return JSON.parse(sessionStorage.getItem(draftKey(doctor)) || "{}") || {};
  } catch {
    return {};
  }
};
const writeDraft = (doctor: string, draft: Draft | null) => {
  try {
    if (draft) sessionStorage.setItem(draftKey(doctor), JSON.stringify(draft));
    else sessionStorage.removeItem(draftKey(doctor));
  } catch {
    // private mode: the form just starts empty after the gateway
  }
};

const Section = ({
  icon,
  tone = "tone-indigo",
  title,
  hint,
  children,
  aside,
}: {
  icon: ReactNode;
  tone?: string;
  title: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
  aside?: ReactNode;
}) => (
  <section className={classes.section}>
    <header className={classes.sectionHead}>
      <span className={`${classes.sectionIcon} ${tone}`}>
        <Ixon width="1.1rem">{icon}</Ixon>
      </span>
      <div className={classes.sectionTitles}>
        <h2 className={classes.sectionTitle}>{title}</h2>
        {!!hint && <p className={classes.sectionHint}>{hint}</p>}
      </div>
      {aside}
    </header>
    <div className={classes.sectionBody}>{children}</div>
  </section>
);

// the slot in the link, checked: a Tehran day from today on, a real range,
// today only from now on
const parsePick = (sp: URLSearchParams) => {
  const d = sp.get("d");
  const s = Number(sp.get("s"));
  const e = Number(sp.get("e"));
  if (!d && !sp.get("s") && !sp.get("e")) return { pick: null, bad: false };
  if (!d || !isYmd(d) || !Number.isFinite(s) || !Number.isFinite(e)) return { pick: null, bad: true };
  const today = tehranTodayYmd();
  if (d < today || s >= e || s < 0 || e > 24 * 60 || (d === today && s <= tehranMinutesOfDay()))
    return { pick: null, bad: true };
  return { pick: { ymd: d, start: s, end: e }, bad: false };
};

// ------------------------------------------------------------------ page

// /book/finalize/<doctor>[?d=YYYY-MM-DD&s=&e=&t=&o=]
// Step 1 (choose) when the link has no slot, step 2 (details: who, why,
// insurance, code, payment, the price and the policy) when it has one.
// The booking posts the Tehran day as "YYYY-MM-DD". A guest signs in
// inline; the slot stays on screen the whole time.
const FinalizeBookingPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const nf = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const money = useCallback((n: number) => getContent("xToman", [nf.format(Math.max(0, Math.round(n)))]), [getContent, nf]);

  const { pick: linkPick, bad } = useMemo(() => parsePick(new URLSearchParams(searchParams.toString())), [searchParams]);
  const linkType = searchParams.get("t") as DoctorSessionType | null;
  const linkOffice = searchParams.get("o");
  const resumed = searchParams.get("resume") === "1";

  const { data: doctor, error: doctorError } = useSWR<FinalizeBookingDoctor>(
    nodeId ? `${API}/public/dr/${nodeId}/id` : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );
  const { data: config } = useSWR<DoctorConfig>(
    nodeId ? `${API}/public/doctor/${nodeId}/config` : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const activeTypes = useMemo(
    () => (config ? visitTypeOrder.filter((t) => config[t]?.active && !!config[t]?.price) : []),
    [config],
  );
  const sessionType: DoctorSessionType | null =
    (linkType && activeTypes.includes(linkType) ? linkType : null) || (activeTypes.length ? activeTypes[0] : null);

  // places of this doctor's shifts (name, address, map point)
  const officeOf = useMemo(() => {
    const map = new Map<string, NonNullable<IDoctorShift<{ Office: Record<never, never> }>["office"]>>();
    for (const sh of Array.isArray(doctor?.shifts) ? doctor.shifts : []) {
      const o = (sh as IDoctorShift<{ Office: Record<never, never> }>)?.office;
      if (o && typeof o === "object" && o._id) map.set(o._id, o);
    }
    return map;
  }, [doctor?.shifts]);

  const { user, isUserLoading } = useUser();
  // once the sign-in form is up it stays mounted while the user reloads
  // (a refetch would otherwise reset it to the phone step mid-OTP)
  const [wasGuest, setWasGuest] = useState(false);
  useEffect(() => {
    if (!isUserLoading && !user) setWasGuest(true);
  }, [isUserLoading, user]);
  const pushNotification = useNotification();
  const push = useProgress();

  // ---- slot: still free?
  const { data: slots } = useBookableSlots(nodeId, sessionType, null);
  const freeSlot = useMemo(() => {
    if (!linkPick || !slots) return undefined;
    const day = slots.days.find((d) => d.ymd === linkPick.ymd);
    return day?.bounds.find((b) => b.start === linkPick.start && b.end === linkPick.end) || null;
  }, [linkPick, slots]);
  const office = (linkOffice && officeOf.has(linkOffice) ? linkOffice : null) || freeSlot?.office || null;
  const officeDoc = office ? officeOf.get(office) : undefined;

  const setPick = useCallback(
    (p: SlotPick | null, type: DoctorSessionType | null = sessionType) => {
      const q = new URLSearchParams();
      if (p) {
        q.set("d", p.ymd);
        q.set("s", String(p.start));
        q.set("e", String(p.end));
        q.set("o", p.office);
      }
      if (type) q.set("t", type);
      router.replace(`${pathname}?${q.toString()}`, { scroll: false });
    },
    [pathname, router, sessionType],
  );

  // ---- step 1 (choose) state
  const [choice, setChoice] = useState<SlotPick | null>(null);
  const [chooseType, setChooseType] = useState<DoctorSessionType | null>(null);
  const [chooseOffice, setChooseOffice] = useState<string | null>(null);
  const [changeOpen, setChangeOpen] = useState(false);
  const pickType = chooseType || sessionType;
  const offices = useMemo(
    () =>
      (Array.isArray(config?.offices) ? config.offices : [])
        .filter((o) => o && o.active !== false)
        .map((o) => ({ _id: o._id, name: o.name, address: (o as { address?: string }).address })),
    [config],
  );
  const pickOffice = pickType === "inPerson" && offices.length > 1 ? chooseOffice || offices[0]._id : null;
  useEffect(() => setChoice(null), [pickType, pickOffice]);

  const today = tehranTodayYmd();
  const dayText = (ymd: string) => {
    const diff = diffDaysYmd(today, ymd);
    const date = tehranNoon(ymd).toLocaleDateString(intlTag, {
      timeZone: TEHRAN_TZ,
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    return diff === 0
      ? getContent("bfDayAndDate", [getContent("today"), date])
      : diff === 1
        ? getContent("bfDayAndDate", [getContent("tomorrow"), date])
        : date;
  };

  useEffect(() => {
    if (bad) router.replace(pathname);
  }, [bad, pathname, router]);

  if (doctorError)
    return (
      <div className={classes.page}>
        <div className={classes.errorBox} role="alert">
          <p>{getContent("bfDoctorMissing")}</p>
          <Button href="/book" size="M" radius="High">
            {getContent("bfFindDoctor")}
          </Button>
        </div>
      </div>
    );

  const name = doctor ? getDoctorProfileLabel(doctor as unknown as IDoctorProfile) : "";
  const speciality = doctor?.mainSpeciality as { name?: string; slug?: string; _id?: string } | undefined;

  const doctorCard = (
    <div className={classes.doctor}>
      {doctor?.avatar ? (
        <span className={classes.avatar}>
          <HostedImage src={doctor.avatar} alt={name} fill sizes="3.5rem" style={{ objectFit: "cover" }} />
        </span>
      ) : (
        <InitialAvatar name={name || "…"} seed={nodeId} size="3.5rem" />
      )}
      <div className={classes.doctorText}>
        <strong>{name || "…"}</strong>
        {!!speciality?.name && <span>{speciality.name}</span>}
      </div>
      {!!doctor && (
        <Link className={classes.profileLink} href={`/dr/${doctor.slug || doctor._id}`}>
          {getContent("bfProfile")}
        </Link>
      )}
    </div>
  );

  const otherDoctors = !!speciality?.name && (
    <Button href={`/speciality/${speciality.slug || speciality._id}`} variant="Primary" mode="Outline" size="S" radius="High">
      {getContent("bfOtherDoctors", [speciality.name])}
    </Button>
  );

  const chooser = (
    <div className={classes.chooser}>
      <div className={classes.block}>
        <h3 className={classes.blockTitle}>{getContent("bfVisitType")}</h3>
        {config ? (
          <VisitTypePicker settings={config} value={pickType} onChange={(t) => setChooseType(t)} />
        ) : (
          <div className={classes.skeleton} style={{ height: "7rem" }} />
        )}
      </div>
      {pickType === "inPerson" && offices.length > 1 && (
        <div className={classes.block}>
          <h3 className={classes.blockTitle}>{getContent("bfOffice")}</h3>
          <OfficePicker offices={offices} value={pickOffice} onChange={setChooseOffice} />
        </div>
      )}
      <div className={classes.block}>
        <h3 className={classes.blockTitle}>{getContent("bfPickTime")}</h3>
        <SlotPicker
          doctorId={nodeId}
          sessionType={pickType}
          office={pickOffice}
          value={choice}
          onChange={setChoice}
          fallback={otherDoctors}
          waitlist
        />
      </div>
    </div>
  );

  // ---------------------------------------------------- step 1: choose
  if (!linkPick) {
    return (
      <div className={classes.page}>
        <BookingSteps current={0} />
        <div className={classes.layout}>
          <div className={classes.main}>
            <div className={classes.card}>{doctorCard}</div>
            <div className={classes.card}>
              {config && !activeTypes.length ? (
                <div className={classes.block}>
                  <p className={classes.muted}>{getContent("bfNoOnlineBooking")}</p>
                  {otherDoctors}
                </div>
              ) : (
                chooser
              )}
            </div>
          </div>
          <aside className={classes.aside}>
            <div className={`${classes.card} ${classes.sticky}`}>
              <h3 className={classes.blockTitle}>{getContent("bfYourVisit")}</h3>
              <p className={classes.muted}>{choice ? dayText(choice.ymd) : getContent("bfPickATime")}</p>
              {!!choice && <strong className={classes.bigTime}>{clock(choice.start, nf)}</strong>}
              <Button
                size="L"
                radius="High"
                variant={choice ? "Primary" : "Disable"}
                className={classes.wide}
                onClick={() => choice && setPick(choice, pickType)}
              >
                {getContent("bfContinue")}
              </Button>
            </div>
          </aside>
        </div>
        <div className={classes.mobileBar}>
          <div className={classes.mobileBarText}>
            <b>{choice ? `${dayText(choice.ymd)} · ${clock(choice.start, nf)}` : getContent("bfPickATime")}</b>
          </div>
          <Button size="M" radius="High" variant={choice ? "Primary" : "Disable"} onClick={() => choice && setPick(choice, pickType)}>
            {getContent("bfContinue")}
          </Button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------- step 2: details
  const takenBanner = slots && freeSlot === null && (
    <div className={classes.taken} role="alert">
      <Ixon width="1.1rem">
        <AlertTriangleIcon />
      </Ixon>
      <div>
        <strong>{getContent("bfSlotTaken")}</strong>
        <p>{getContent("bfSlotTakenText")}</p>
      </div>
      <Button size="S" radius="High" onClick={() => setChangeOpen(true)}>
        {getContent("bfPickAnother")}
      </Button>
    </div>
  );

  const visitSummary = (
    <div className={classes.visit}>
      {doctorCard}
      <ul className={classes.facts}>
        <li>
          <span className={`${classes.factIcon} ${sessionType ? visitTypeTone[sessionType] : "tone-indigo"}`}>
            <Ixon width="0.95rem">{sessionType ? visitTypeIcon[sessionType] : <HospitalIcon />}</Ixon>
          </span>
          <span>{sessionType ? getContent(doctorSessionTypeContentKeyDict[sessionType]) : "…"}</span>
        </li>
        <li>
          <span className={`${classes.factIcon} tone-violet`}>
            <Ixon width="0.95rem">
              <Calendar02Icon />
            </Ixon>
          </span>
          <span>
            <b>{dayText(linkPick.ymd)}</b>
            <br />
            {getContent("fromTimeXtoTimeY", [clock(linkPick.start, nf), clock(linkPick.end, nf)])}
          </span>
        </li>
        {sessionType === "inPerson" && !!officeDoc && (
          <li>
            <span className={`${classes.factIcon} tone-teal`}>
              <Ixon width="0.95rem">
                <LocationIcon />
              </Ixon>
            </span>
            <span>
              <b>{officeDoc.name}</b>
              {!!(officeDoc as { address?: string }).address && (
                <>
                  <br />
                  {(officeDoc as { address?: string }).address}
                </>
              )}
            </span>
          </li>
        )}
      </ul>
      <TehranTimeHint ns={NS} />
      {sessionType === "inPerson" && (
        <LeaveByHint
          coords={(officeDoc as { location?: { coordinates?: [number, number] } } | undefined)?.location?.coordinates}
          date={tehranNoon(linkPick.ymd)}
          start={linkPick.start}
        />
      )}
      <button type="button" className={classes.change} onClick={() => setChangeOpen(true)}>
        <Ixon width="0.9rem">
          <EditIcon />
        </Ixon>
        {getContent("bfChangeTime")}
      </button>
    </div>
  );

  const changeSheet = (
    <BottomSheet
      open={changeOpen}
      onClose={() => setChangeOpen(false)}
      title={getContent("bfChangeTime")}
      closeLabel={getContent("bfClose")}
      footer={
        <Button
          size="L"
          radius="High"
          className={classes.wide}
          variant={choice ? "Primary" : "Disable"}
          onClick={() => {
            if (!choice) return;
            setPick(choice, pickType);
            setChangeOpen(false);
          }}
        >
          {choice ? `${getContent("bfUseThisTime")} · ${clock(choice.start, nf)}` : getContent("bfPickATime")}
        </Button>
      }
    >
      {chooser}
    </BottomSheet>
  );

  return (
    <div className={classes.page}>
      <BookingSteps current={1} />
      {takenBanner}
      <div className={classes.layout}>
        <div className={classes.main}>
          <div className={`${classes.card} ${classes.mobileOnly}`}>{visitSummary}</div>
          {isUserLoading && !wasGuest ? (
            <div className={`${classes.card} ${classes.skeleton}`} style={{ height: "14rem" }} />
          ) : !user ? (
            <div className={classes.card}>
              <Section icon={<LockIcon />} title={getContent("bfLoginTitle")} hint={getContent("bfLoginHint")}>
                <InlineLogin />
              </Section>
            </div>
          ) : doctor && sessionType ? (
            <Details
              doctor={doctor}
              sessionType={sessionType}
              office={office}
              pick={linkPick}
              blocked={freeSlot === null}
              resumed={resumed}
              money={money}
              onBooked={(id) => push(`/dashboard/booking/${id}?new=1`)}
              notify={pushNotification}
            />
          ) : (
            <div className={`${classes.card} ${classes.skeleton}`} style={{ height: "14rem" }} />
          )}
        </div>
        <aside className={classes.aside}>
          <div className={`${classes.card} ${classes.sticky}`}>{visitSummary}</div>
        </aside>
      </div>
      {changeSheet}
    </div>
  );
};

// ------------------------------------------------------------- details

const Details = ({
  doctor,
  sessionType,
  office,
  pick,
  blocked,
  resumed,
  money,
  onBooked,
  notify,
}: {
  doctor: FinalizeBookingDoctor;
  sessionType: DoctorSessionType;
  office: string | null;
  pick: { ymd: string; start: number; end: number };
  blocked: boolean;
  resumed: boolean;
  money: (n: number) => string;
  onBooked: (id: string) => void;
  notify: ReturnType<typeof useNotification>;
}) => {
  const getContent = useScopedLocale(NS);
  const { user } = useUser();
  const { freeCancelHoursText, emergencyNumberText } = useSiteSettings();
  const { data: payment } = usePaymentConfig();

  const { data: identity, mutate: mutateIdentity } = useSWR<IUserIdentity | null>(
    `${API}/user/identity`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );
  const { data: relatives, mutate: mutateRelatives } = useSWR<IUserIdentity[]>(
    identity ? `${API}/user/relative` : null,
    (url: string) => fetcher({ url }).then((res) => (Array.isArray(res.data) ? res.data : [])),
  );

  const [draft, setDraft] = useState<Draft>(() => (typeof window === "undefined" ? {} : readDraft(doctor._id)));
  const update = (patch: Partial<Draft>) => setDraft((prev) => ({ ...prev, ...patch }));
  // a saved pick that is no longer on the list falls back to me
  const patientId =
    draft.patient && (draft.patient === identity?._id || (relatives || []).some((r) => r?._id === draft.patient))
      ? draft.patient
      : identity?._id;
  const [codeInput, setCodeInput] = useState(draft.code || "");
  const [codeOpen, setCodeOpen] = useState(!!draft.code);
  const [addOpen, setAddOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [charge, setCharge] = useState<{ amount: number; returnPath: string } | null>(null);

  // the insurances picked (an older draft kept one)
  const picks: InsurancePick[] = useMemo(
    () => draft.insurances ?? (draft.insurance ? [{ insurance: draft.insurance, plan: null }] : []),
    [draft.insurances, draft.insurance],
  );
  const picksKey = picks.map((p) => `${p.insurance}:${p.plan || ""}`).join(",");

  const { data: quote, isValidating: quoting } = useSWR<BookingQuote>(
    user ? [`${API}/booking/quote`, doctor._id, sessionType, office || "", patientId || "", draft.code || "", picksKey, pick.ymd] : null,
    ([url, d, st, o, p, c, ins, day]: string[]) =>
      fetcher({
        url,
        method: "POST",
        payload: {
          doctor: d,
          sessionType: st,
          date: day,
          ...(o ? { office: o } : {}),
          ...(p ? { patient: p } : {}),
          ...(c ? { code: c } : {}),
          ...(ins
            ? {
                insurances: ins.split(",").map((x) => {
                  const [insurance, plan] = x.split(":");
                  return { insurance, plan: plan || null };
                }),
              }
            : {}),
        },
      }).then((res) => res.data),
    { revalidateOnFocus: false, keepPreviousData: true },
  );

  // the insurances this patient used last time are preselected, when this
  // doctor accepts them (Zocdoc keeps the insurance on the account)
  const [preselected, setPreselected] = useState(false);
  useEffect(() => {
    if (!quote || draft.insurances !== undefined || draft.insurance) return;
    const accepted = new Set((Array.isArray(quote.insurances) ? quote.insurances : []).map((o) => o?._id));
    const saved = (Array.isArray(quote.insurance?.saved) ? quote.insurance!.saved : []).filter((p) => accepted.has(p?.insurance));
    if (saved.length) {
      setDraft((prev) => (prev.insurances !== undefined ? prev : { ...prev, insurances: saved }));
      setPreselected(true);
    }
  }, [quote, draft.insurances, draft.insurance]);

  // the default way to pay: the wallet when it covers the visit, else at
  // the desk for an in-person visit, else the gateway when it is on
  const method: Method =
    draft.method ||
    (quote && quote.balance >= quote.total
      ? "wallet"
      : sessionType === "inPerson" && !!quote?.payAtDesk
        ? "desk"
        : payment?.sepEnabled
          ? "gateway"
          : "wallet");
  // in person, and only where the doctor takes payment at the desk (the
  // quote says; the server refuses it otherwise)
  const deskAllowed = sessionType === "inPerson" && !!quote?.payAtDesk;
  useEffect(() => {
    if (quote && method === "desk" && !deskAllowed) update({ method: "wallet" });
  }, [deskAllowed, method, quote]);
  // back from the gateway: the top-up is in the wallet now
  useEffect(() => {
    if (resumed) update({ method: "wallet" });
  }, [resumed]);

  if (identity === null)
    return (
      <div className={classes.card}>
        <Section icon={<UserIcon />} title={getContent("bfVerifyTitle")} hint={getContent("bfVerifyHint")}>
          <IdentityVerifyForm onDone={() => mutateIdentity()} />
        </Section>
      </div>
    );
  if (!identity)
    return <div className={`${classes.card} ${classes.skeleton}`} style={{ height: "14rem" }} />;

  const people = [identity, ...(relatives || [])].filter((p) => !!p?._id);
  const insurances: InsuranceOption[] = (Array.isArray(quote?.insurances) ? quote!.insurances : []).filter((o) => !!o?._id);
  const insLines = Array.isArray(quote?.insurance?.lines) ? quote!.insurance!.lines : [];
  const notAccepted = Array.isArray(quote?.insurance?.notAccepted) ? quote!.insurance!.notAccepted : [];
  const picked = (id: string) => picks.some((p) => p.insurance === id);
  // one basic and one supplementary at most: picking one replaces the
  // other of its kind; basic first
  const isBasicId = (id: string) => !!insurances.find((o) => o._id === id)?.isBasic;
  const togglePick = (o: InsuranceOption) => {
    const rest = picks.filter((p) => p.insurance !== o._id && isBasicId(p.insurance) !== !!o.isBasic);
    // no plan until the patient says which is theirs
    const next = picked(o._id) ? rest : [...rest, { insurance: o._id, plan: null }];
    update({ insurances: next.sort((a, b) => Number(isBasicId(b.insurance)) - Number(isBasicId(a.insurance))) });
    setPreselected(false);
  };
  // a second tap on the plan picked clears it
  const setPlan = (id: string, plan: string) =>
    update({ insurances: picks.map((p) => (p.insurance === id ? { ...p, plan: p.plan === plan ? null : plan } : p)) });
  const insGroups = [
    { key: "basic", title: getContent("bfInsBasic"), list: insurances.filter((o) => o.isBasic) },
    { key: "supp", title: getContent("bfInsSupp"), list: insurances.filter((o) => !o.isBasic) },
  ].filter((g) => g.list.length);
  const payNow = method === "desk" ? 0 : quote?.total || 0;
  const shortfall = method === "wallet" && quote ? Math.max(0, quote.total - quote.balance) : 0;
  const canSubmit = !!quote && !!patientId && !blocked && !busy && !(method === "wallet" && shortfall > 0);

  const submit = async () => {
    if (!quote || !patientId || busy || blocked) return;
    if (method === "gateway") {
      // top up what the wallet lacks, come back here to confirm
      const need = Math.max(0, quote.total - quote.balance);
      if (need <= 0) return update({ method: "wallet" });
      writeDraft(doctor._id, { ...draft, method: "wallet" });
      const q = new URLSearchParams(window.location.search);
      q.set("resume", "1");
      setCharge({ amount: Math.max(need, payment?.minAmount || 1), returnPath: `${window.location.pathname}?${q.toString()}` });
      return;
    }
    setBusy(true);
    try {
      const res = await fetcher({
        url: `${API}/booking/reserve`,
        method: "POST",
        payload: {
          doctor: doctor._id,
          // the Tehran day as "YYYY-MM-DD": the server reads it as that day
          date: pick.ymd,
          start: pick.start,
          end: pick.end,
          sessionType,
          patient: patientId,
          method: method === "desk" ? "desk" : "wallet",
          ...(office ? { office } : {}),
          ...(draft.code && quote.code?.applied ? { code: draft.code } : {}),
          ...(picks.length ? { insurances: picks } : {}),
        },
      });
      const booked = res?.data as IReservation | undefined;
      if (!booked?._id) throw new Error(getContent("bfBookFailed"));
      // the reason for the visit goes to the doctor's questionnaire
      const complaint = (draft.complaint || "").trim();
      if (complaint.length >= 2)
        await fetcher({
          url: `${API}/user/reservation/${booked._id}/intake`,
          method: "PUT",
          payload: { complaint, ...(draft.onset ? { onset: draft.onset } : {}) },
        }).catch(() => undefined);
      writeDraft(doctor._id, null);
      onBooked(booked._id);
    } catch (err) {
      notify(err instanceof FetchError || err instanceof Error ? err.message : getContent("bfBookFailed"), "Error");
      setBusy(false);
    }
  };

  const ctaText =
    method === "desk"
      ? getContent("bfConfirmDesk")
      : method === "gateway"
        ? getContent("bfPayGateway", [money(Math.max(0, (quote?.total || 0) - (quote?.balance || 0)))])
        : payNow > 0
          ? getContent("bfConfirmPay", [money(payNow)])
          : getContent("bfConfirmFree");

  const methods: { key: Method; icon: ReactNode; title: ContentKey; text: string; show: boolean }[] = [
    {
      key: "wallet",
      icon: <WalletIcon />,
      title: "bfPayWallet",
      text: getContent("bfWalletBalance", [money(quote?.balance || 0)]),
      show: true,
    },
    {
      key: "gateway",
      icon: <ShieldCheckIcon />,
      title: "bfPayOnline",
      text: getContent("bfPayOnlineText"),
      show: !!payment?.sepEnabled && (quote?.total || 0) > (quote?.balance || 0),
    },
    {
      key: "desk",
      icon: <HospitalIcon />,
      title: "bfPayDesk",
      text: getContent("bfPayDeskText"),
      show: deskAllowed,
    },
  ];

  return (
    <div className={classes.details}>
      {resumed && (
        <div className={classes.resumed} role="status">
          <Ixon width="1rem">
            <CheckIcon />
          </Ixon>
          {getContent("bfTopUpDone")}
        </div>
      )}

      {/* who */}
      <div className={classes.card}>
        <Section icon={<UserIcon />} title={getContent("bfWho")} hint={getContent("bfWhoHint")}>
          <div className={classes.chips} role="radiogroup">
            {people.map((p) => {
              const on = patientId === p._id;
              const isSelf = p._id === identity._id;
              return (
                <button
                  key={p._id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  className={`${classes.person} ${on ? classes.on : ""}`}
                  onClick={() => update({ patient: p._id })}
                >
                  <span className={classes.check}>{on && <CheckIcon />}</span>
                  <span className={classes.personText}>
                    <b>{`${p.givenName || ""} ${p.lastName || ""}`.trim() || "—"}</b>
                    <small>{isSelf ? getContent("bfMyself") : getContent("bfFamily")}</small>
                  </span>
                </button>
              );
            })}
            <button type="button" className={classes.addPerson} onClick={() => setAddOpen((v) => !v)} aria-expanded={addOpen}>
              <Ixon width="1rem">
                <PlusIcon />
              </Ixon>
              {getContent("bfAddFamily")}
            </button>
          </div>
          {addOpen && (
            <AddFamily
              onDone={async () => {
                const list = await mutateRelatives();
                const last = Array.isArray(list) ? list[list.length - 1] : null;
                if (last?._id) update({ patient: last._id });
                setAddOpen(false);
              }}
              notify={notify}
            />
          )}
        </Section>
      </div>

      {/* why */}
      <div className={classes.card}>
        <Section
          icon={<MedicalRecordIcon />}
          tone="tone-violet"
          title={getContent("bfReason")}
          hint={getContent("bfReasonHint")}
          aside={<span className={classes.optional}>{getContent("bfOptional")}</span>}
        >
          <textarea
            className={classes.textarea}
            rows={3}
            maxLength={1000}
            value={draft.complaint || ""}
            placeholder={getContent("bfReasonPlaceholder")}
            onChange={(e) => update({ complaint: e.target.value })}
          />
          <div className={classes.onsets}>
            <span className={classes.muted}>{getContent("bfSince")}</span>
            {onsets.map((o) => (
              <button
                key={o}
                type="button"
                aria-pressed={draft.onset === o}
                className={`${classes.pill} ${draft.onset === o ? classes.pillOn : ""}`}
                onClick={() => update({ onset: draft.onset === o ? null : o })}
              >
                {getContent(onsetKey[o])}
              </button>
            ))}
          </div>
          <p className={classes.redFlag}>
            <Ixon width="0.9rem">
              <AlertTriangleIcon />
            </Ixon>
            {getContent("bfRedFlag", [emergencyNumberText])}
          </p>
        </Section>
      </div>

      {/* insurance: the doctor's accepted insurances, the estimated share live */}
      {(!!insurances.length || !!notAccepted.length) && (
        <div className={classes.card}>
          <Section icon={<ShieldCheckIcon />} tone="tone-teal" title={getContent("bfInsurance")} hint={getContent("bfInsuranceHint")}>
            {insGroups.map((g) => (
              <div key={g.key} className={classes.insGroup}>
                {insGroups.length > 1 && <span className={classes.insGroupTitle}>{g.title}</span>}
                <div className={classes.chips} role="group" aria-label={g.title}>
                  {g.list.map((o) => {
                    const on = picked(o._id);
                    return (
                      <button
                        key={o._id}
                        type="button"
                        aria-pressed={on}
                        className={`${classes.pill} ${on ? classes.pillOn : ""}`}
                        onClick={() => togglePick(o)}
                      >
                        {o.name}
                        <small className={classes.pillHint}>
                          {o.covered ? getContent("bfInsChipCovered") : getContent("bfInsChipNoTariff")}
                        </small>
                      </button>
                    );
                  })}
                </div>
                {g.list
                  .filter((o) => picked(o._id) && (o.plans?.length || 0) > 0)
                  .map((o) => (
                    <div key={o._id} className={classes.onsets} role="group" aria-label={getContent("bfInsPlan")}>
                      <span className={classes.muted}>{getContent("bfInsPlanOf", [o.name])}</span>
                      {(o.plans || []).map((pl) => {
                        const on = picks.find((p) => p.insurance === o._id)?.plan === pl._id;
                        return (
                          <button
                            key={pl._id}
                            type="button"
                            aria-pressed={on}
                            className={`${classes.pill} ${on ? classes.pillOn : ""}`}
                            onClick={() => setPlan(o._id, pl._id)}
                          >
                            {pl.name}
                          </button>
                        );
                      })}
                    </div>
                  ))}
              </div>
            ))}
            {!!insurances.length && (
              <div className={classes.chips}>
                <button
                  type="button"
                  aria-pressed={!picks.length}
                  className={`${classes.pill} ${!picks.length ? classes.pillOn : ""}`}
                  onClick={() => (update({ insurances: [] }), setPreselected(false))}
                >
                  {getContent("bfNoInsurance")}
                </button>
              </div>
            )}
            {preselected && !!picks.length && <p className={classes.muted}>{getContent("bfInsRemembered")}</p>}
            {notAccepted.map((n) => (
              <p key={n._id} className={classes.insNotHere}>
                <Ixon width="0.9rem">
                  <AlertTriangleIcon />
                </Ixon>
                {getContent("bfInsNotHere", [n.name])}
              </p>
            ))}
            {!!quote?.insurance?.error && <p className={classes.codeBad}>{quote.insurance.error}</p>}
            {!!insLines.length && !!quote && (
              <ul className={classes.insLines} aria-live="polite">
                {insLines.map((l) => (
                  <li key={l.insurance}>
                    <span>
                      {l.planName ? `${l.name} · ${l.planName}` : l.name}
                      <small>{l.role === "basic" ? getContent("bfInsBasic") : getContent("bfInsSupp")}</small>
                    </span>
                    <b>
                      {l.share > 0
                        ? money(l.share)
                        : l.reason === "limit"
                          ? getContent("bfInsOverLimit")
                          : getContent("bfInsNoTariffLine")}
                    </b>
                  </li>
                ))}
                <li className={classes.insYou}>
                  <span>{getContent("bfInsYourShare")}</span>
                  <b>{money(method === "desk" ? quote.deskTotal : quote.total)}</b>
                </li>
              </ul>
            )}
            {!!insLines.length && (
              <p className={classes.note}>
                {getContent(method === "desk" ? "bfInsDeskNote" : "bfInsOnlineNote")} {getContent("bfInsuranceNote")}
              </p>
            )}
          </Section>
        </div>
      )}

      {/* pay */}
      <div className={classes.card}>
        <Section icon={<WalletIcon />} tone="tone-amber" title={getContent("bfPayment")}>
          <div className={classes.methods} role="radiogroup">
            {methods
              .filter((m) => m.show)
              .map((m) => (
                <button
                  key={m.key}
                  type="button"
                  role="radio"
                  aria-checked={method === m.key}
                  className={`${classes.method} ${method === m.key ? classes.on : ""}`}
                  onClick={() => update({ method: m.key })}
                >
                  <span className={classes.check}>{method === m.key && <CheckIcon />}</span>
                  <span className={classes.methodIcon}>
                    <Ixon width="1.2rem">{m.icon}</Ixon>
                  </span>
                  <span className={classes.personText}>
                    <b>{getContent(m.title)}</b>
                    <small>{m.text}</small>
                  </span>
                </button>
              ))}
          </div>
          {method === "wallet" && !!quote && <WalletShortfallTopUp balance={quote.balance} total={quote.total} />}
          {method === "wallet" && shortfall > 0 && !payment?.sepEnabled && (
            <p className={classes.note}>{getContent("bfWalletShort", [money(shortfall)])}</p>
          )}

          {/* club code */}
          {!codeOpen ? (
            <button type="button" className={classes.codeToggle} onClick={() => setCodeOpen(true)}>
              <Ixon width="0.95rem">
                <TagIcon />
              </Ixon>
              {getContent("bfHaveCode")}
            </button>
          ) : (
            <div className={classes.code}>
              <Input
                title={getContent("bfClubCode")}
                defaultValue={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              />
              <Button
                size="M"
                radius="High"
                mode="Outline"
                isLoading={quoting && !!codeInput && codeInput === draft.code}
                onClick={() => update({ code: codeInput.trim() })}
              >
                {getContent("bfApply")}
              </Button>
              {!!draft.code && quote?.code && (
                <p className={quote.code.applied ? classes.codeOk : classes.codeBad}>
                  {quote.code.applied ? getContent("bfCodeApplied", [quote.code.name || draft.code]) : getContent("bfCodeInvalid")}
                </p>
              )}
            </div>
          )}

          {!!quote && !quote.pro && !!quote.proPotential && method !== "desk" && (
            <ProUpsellCard moment="booking" amount={quote.proPotential} />
          )}
        </Section>
      </div>

      {/* price + policy + confirm */}
      <div className={`${classes.card} ${classes.totalCard}`}>
        {!quote ? (
          <div className={classes.skeleton} style={{ height: "8rem" }} />
        ) : (
          <dl className={classes.lines}>
            <div>
              <dt>{getContent("bfVisitFee")}</dt>
              <dd>{money(quote.price)}</dd>
            </div>
            {quote.clubDiscount > 0 && (
              <div className={classes.minus}>
                <dt>{getContent("bfClubDiscount")}</dt>
                <dd>{`− ${money(quote.clubDiscount)}`}</dd>
              </div>
            )}
            {insLines
              .filter((l) => l.share > 0)
              .map((l) => (
                <div key={l.insurance} className={classes.minus}>
                  <dt>{getContent("bfInsShareLine", [l.name])}</dt>
                  <dd>{`− ${money(l.share)}`}</dd>
                </div>
              ))}
            {quote.tax > 0 && (
              <div>
                <dt>{getContent("tax")}</dt>
                <dd>{money(quote.tax)}</dd>
              </div>
            )}
            {method !== "desk" && quote.proDiscount > 0 && (
              <div className={classes.minus}>
                <dt>{getContent("proDiscountLine")}</dt>
                <dd>{`− ${money(quote.proDiscount)}`}</dd>
              </div>
            )}
            <div className={classes.totalLine}>
              <dt>{method === "desk" ? getContent("bfPayAtVisit") : getContent("bfPayNow")}</dt>
              <dd>{money(method === "desk" ? quote.deskTotal : quote.total)}</dd>
            </div>
          </dl>
        )}
        {(quote?.insurance?.insurerShare || 0) > 0 && <p className={classes.estimate}>{getContent("bfInsEstimate")}</p>}
        <div className={classes.policy}>
          <Ixon width="1rem">
            <ShieldCheckIcon />
          </Ixon>
          <p>
            {method === "desk"
              ? getContent("bfPolicyDesk", [freeCancelHoursText])
              : getContent("bfPolicyOnline", [freeCancelHoursText])}
          </p>
        </div>
        <div className={classes.submitRow}>
          <Button
            size="L"
            radius="High"
            className={classes.wide}
            variant={canSubmit || method === "gateway" ? "Primary" : "Disable"}
            isLoading={busy || !!charge}
            onClick={submit}
          >
            {ctaText}
          </Button>
          <p className={classes.agree}>
            {getContent("bfAgreePrefix")} <Link href="/policy">{getContent("bfAgreeLink")}</Link>
            {getContent("bfAgreeSuffix")}
          </p>
        </div>
      </div>

      {/* phone: the total and the action stay under the thumb */}
      <div className={classes.mobileBar}>
        <div className={classes.mobileBarText}>
          <small>{method === "desk" ? getContent("bfPayAtVisit") : getContent("bfPayNow")}</small>
          <b>{quote ? money(method === "desk" ? quote.deskTotal : quote.total) : "…"}</b>
        </div>
        <Button
          size="M"
          radius="High"
          variant={canSubmit || method === "gateway" ? "Primary" : "Disable"}
          isLoading={busy || !!charge}
          onClick={submit}
        >
          {method === "desk" ? getContent("bfConfirmShort") : method === "gateway" ? getContent("bfPayShort") : getContent("bfConfirmShort")}
        </Button>
      </div>
      <WalletChargeAct payload={charge} onFailed={() => setCharge(null)} />
    </div>
  );
};

// a family member, added inline (POST /user/relative; the identity check
// is the same as for the account holder)
const AddFamily = ({ onDone, notify }: { onDone: () => unknown; notify: ReturnType<typeof useNotification> }) => {
  const getContent = useScopedLocale(NS);
  const [form, setForm] = useState<{ nationalCode?: string; birthDate?: Date; phone?: string }>({});
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (busy) return;
    if (!form.nationalCode || !form.birthDate) return notify(getContent("bfFillFamily"), "Warn");
    setBusy(true);
    try {
      await fetcher({ url: `${API}/user/relative`, method: "POST", payload: form });
      await onDone();
    } catch (err) {
      notify(err instanceof Error ? err.message : String(err), "Error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className={classes.addForm}>
      <Input
        title={getContent("nationalCode")}
        inputMode="numeric"
        onChange={(e) => setForm((p) => ({ ...p, nationalCode: e.target.value }))}
      />
      <DateInput title={getContent("dateOfBirth")} onChange={(d) => setForm((p) => ({ ...p, birthDate: d }))} />
      <Input
        title={getContent("phoneNumber")}
        inputMode="tel"
        onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
      />
      <Button size="M" radius="High" isLoading={busy} onClick={save}>
        {getContent("bfAddFamilySave")}
      </Button>
    </div>
  );
};

export default FinalizeBookingPage;
