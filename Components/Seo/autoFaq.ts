// The automatic FAQ of a public profile (2026-10, SEO). DrDr, Paziresh24,
// Doctoreto and Zocdoc close a doctor / centre page with the questions
// patients search for ("how do I book Dr X", "what does a visit cost",
// "where is the office"), answered from the profile's own data. Here:
//  - the backend gathers the facts (noyanaitest-back Lib/autoFaq.ts for a
//    doctor; a centre's public response already carries them);
//  - this module words them in the page's language - message keys with
//    ${n} placeholders, numbers and dates through Intl on Tehran's clock -
//    and is shared by the visible block, the FAQPage structured data (the
//    same text: Google wants what it reads to be on the page) and the
//    doctor's panel, where each item can be reworded, hidden or moved;
//  - a question whose data is missing is not asked, nothing is padded, and
//    at most MAX_AUTO_FAQ items are generated (no keyword stuffing).
//
// A plain module (no hooks, no "use client"): server components call it.
import { ContentKey } from "../Enums/contentKeys";
import { medicalSystemTitleKeys } from "../DoctorPanel/medicalSystemTitles";
import { tehranDateFormat, tehranNoon, tehranSaturdayDay, tehranYmd } from "../helpers/tehranTime";
import { exceptionsOf, isRoundTheClockWeek, weekOf } from "../OpeningHours/openingHours";

export const MAX_AUTO_FAQ = 10;

export type FaqLink = { href: string; label: string };

// one question as the page shows it (generated, reworded or the provider's
// own); `key` is the generated item's topic
export type FaqEntry = {
  id: string;
  key?: string;
  question: string;
  answer: string;
  link?: FaqLink;
};

export type FaqTranslate = (key: ContentKey, vars?: string[]) => string;

export type FaqContext = {
  t: FaqTranslate;
  // BCP-47 tag (intlLocale of the page's language)
  intl: string;
  // the language's list separator ("، " / ", " / "、")
  sep: string;
};

// ------------------------------------------------------------ facts

type Named = { name?: string; slug?: string };
type VisitType = "inPerson" | "textChat" | "voiceCall" | "sipCall" | "videoCall";

// what GET /public/dr/:slug (and the panel's /doctor/faq/auto) send as
// `autoFaq.facts` - see Lib/autoFaq.ts DoctorFaqFacts
export type DoctorFaqFacts = {
  booking?: { claimed?: boolean; bookable?: boolean; sessionTypes?: VisitType[]; hasPhone?: boolean };
  speciality?: { main?: Named; extra?: Named[]; title?: string; code?: string };
  services?: { services?: { title?: string }[]; diseases?: Named[] };
  fee?: { prices?: { type: VisitType; price: number }[] };
  address?: { offices?: { name?: string; address?: string }[]; city?: Named };
  phone?: { phone?: string };
  workplaces?: { items?: (Named & { kind?: "clinic" | "hospital" })[] };
  online?: { types?: VisitType[] };
  nextSlot?: { ymd?: string; start?: number; type?: VisitType; none?: boolean; days?: number };
  rating?: { average?: number; count?: number };
  insurance?: { items?: Named[] };
};

export type AutoFaqOverride = {
  key: string;
  customQuestion?: string;
  customAnswer?: string;
  hidden?: boolean;
  order?: number | null;
  factsHash?: string;
};

export type AutoFaqPayload = {
  facts?: DoctorFaqFacts;
  hashes?: Record<string, string>;
  overrides?: AutoFaqOverride[];
} | null;

// ------------------------------------------------------------ wording helpers

const visitTypeKey: Record<VisitType, ContentKey> = {
  inPerson: "inPerson",
  textChat: "textChat",
  voiceCall: "voiceCall",
  sipCall: "sipCall",
  videoCall: "videoCall",
};
const visitTypes = Object.keys(visitTypeKey) as VisitType[];
const isVisitType = (v: unknown): v is VisitType => visitTypes.includes(v as VisitType);

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const names = (list: unknown) =>
  arr<Named>(list)
    .map((n) => str(n?.name))
    .filter(Boolean);
const uniq = (list: string[]) => list.filter((v, i) => list.indexOf(v) === i);

const listOf = (ctx: FaqContext, items: string[]) => uniq(items.filter(Boolean)).join(ctx.sep);
// between items that have commas of their own (addresses): the semicolon
const blockSep = (ctx: FaqContext) => (ctx.sep === "، " ? "؛ " : ctx.sep === "、" ? "；" : "; ");

const numberOf = (ctx: FaqContext, n: number, digits = 0) => {
  try {
    return new Intl.NumberFormat(ctx.intl, { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n);
  } catch {
    return String(n);
  }
};
const tomanOf = (ctx: FaqContext, n: number) => `${numberOf(ctx, n)} ${ctx.t("toman")}`;

// minutes since Tehran midnight as HH:MM in the language's digits
const timeOf = (ctx: FaqContext, minutes: number) => {
  const v = Math.max(0, Math.min(1440, Math.round(Number(minutes) || 0)));
  try {
    const two = new Intl.NumberFormat(ctx.intl, { minimumIntegerDigits: 2, useGrouping: false });
    return `${two.format(Math.floor(v / 60))}:${two.format(v % 60)}`;
  } catch {
    return `${String(Math.floor(v / 60)).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}`;
  }
};

const dayOf = (ctx: FaqContext, ymd: string) => {
  try {
    return tehranDateFormat(ctx.intl, { weekday: "long", day: "numeric", month: "long" }).format(tehranNoon(ymd));
  } catch {
    return ymd;
  }
};

const weekdayOf = (ctx: FaqContext, ymd: string) => {
  try {
    return tehranDateFormat(ctx.intl, { weekday: "long" }).format(tehranNoon(ymd));
  } catch {
    return "";
  }
};

// a sentence per part, joined with a space (empty parts dropped)
const sentences = (...parts: (string | false | undefined | null)[]) =>
  parts.filter((p): p is string => typeof p === "string" && !!p.trim()).join(" ");

// «دکتر …» / "Dr. …": the title once, even when the name was typed with it
const DR_PREFIX = /^(دکتر|دكتر|د\.|dr\.?|doctor)\s+/i;
export const doctorDisplayName = (ctx: FaqContext, firstName?: string, lastName?: string) => {
  const name = `${str(firstName)} ${str(lastName)}`.trim().replace(DR_PREFIX, "").trim();
  return name ? ctx.t("afqDrName", [name]) : "";
};

// ------------------------------------------------------------ doctor

type Draft = Omit<FaqEntry, "id"> & { key: string };

export const buildDoctorFaq = (
  facts: DoctorFaqFacts | undefined | null,
  doctor: { firstName?: string; lastName?: string },
  ctx: FaqContext,
): Draft[] => {
  if (!facts || typeof facts !== "object") return [];
  const { t } = ctx;
  const dr = doctorDisplayName(ctx, doctor.firstName, doctor.lastName);
  if (!dr) return [];
  const out: Draft[] = [];
  const typeLabel = (type: VisitType) => t(visitTypeKey[type]);
  const phone = str(facts.phone?.phone);

  // how to book
  const booking = facts.booking;
  if (booking) {
    const types = arr<VisitType>(booking.sessionTypes).filter(isVisitType);
    if (booking.bookable && types.length)
      out.push({
        key: "booking",
        question: t("afqBookQ", [dr]),
        answer: t("afqBookA", [dr, listOf(ctx, types.map(typeLabel))]),
        link: { href: "#dr-booking", label: t("afqLinkBook") },
      });
    else
      out.push({
        key: "booking",
        question: t("afqBookQ", [dr]),
        answer: sentences(
          t(booking.claimed === false ? "afqBookUnclaimedA" : "afqBookOffA", [dr]),
          !!phone && t("afqBookCallA", [phone]),
        ),
        link: { href: "#dr-address", label: t("afqLinkContact") },
      });
  }

  // speciality
  const sp = facts.speciality;
  if (sp) {
    const main = str(sp.main?.name);
    const extra = names(sp.extra).filter((n) => n !== main);
    const titleKey = sp.title ? (medicalSystemTitleKeys as Record<string, ContentKey>)[sp.title] : undefined;
    const answer = sentences(
      !!main && t("afqSpecMainA", [dr, main]),
      !!extra.length && t("afqSpecExtraA", [listOf(ctx, extra)]),
      !!titleKey && t("afqSpecFieldA", [t(titleKey)]),
      !!str(sp.code) && t("afqSpecCodeA", [str(sp.code)]),
    );
    if (answer)
      out.push({
        key: "speciality",
        question: t("afqSpecQ", [dr]),
        answer,
        link: { href: "#dr-speciality", label: t("afqLinkSpeciality") },
      });
  }

  // services / conditions
  const sv = facts.services;
  if (sv) {
    const services = arr<{ title?: string }>(sv.services)
      .map((s) => str(s?.title))
      .filter(Boolean);
    const diseases = names(sv.diseases);
    const main = str(sp?.main?.name);
    const answer = sentences(
      !!services.length && t("afqServicesA", [dr, listOf(ctx, services)]),
      !!diseases.length && !!main && t("afqDiseasesA", [main, listOf(ctx, diseases)]),
    );
    if (answer) out.push({ key: "services", question: t("afqServicesQ", [dr]), answer });
  }

  // visit fee
  const prices = arr<{ type: VisitType; price: number }>(facts.fee?.prices).filter(
    (p) => isVisitType(p?.type) && Number(p.price) > 0,
  );
  if (prices.length)
    out.push({
      key: "fee",
      question: t("afqFeeQ", [dr]),
      answer: t("afqFeeA", [
        uniq(prices.map((p) => t("afqFeeItem", [typeLabel(p.type), tomanOf(ctx, Number(p.price))]))).join(blockSep(ctx)),
      ]),
      ...(facts.booking?.bookable && { link: { href: "#dr-booking", label: t("afqLinkBook") } }),
    });

  // office address(es)
  const offices = arr<{ name?: string; address?: string }>(facts.address?.offices).filter((o) => str(o?.address));
  if (offices.length) {
    const city = str(facts.address?.city?.name);
    const lines = offices.map((o) =>
      str(o.name) ? t("afqAddressItem", [str(o.name), str(o.address)]) : str(o.address),
    );
    const mentionsCity = !!city && lines.some((l) => l.includes(city));
    out.push({
      key: "address",
      question: t("afqAddressQ", [dr]),
      answer: sentences(
        offices.length > 1 ? t("afqAddressManyA", [dr, lines.join(blockSep(ctx))]) : t("afqAddressA", [dr, lines[0]]),
        !!city && !mentionsCity && t("afqCityA", [city]),
      ),
      link: { href: "#dr-address", label: t("afqLinkMap") },
    });
  }

  // public phone (the profile's contact phone; never an account's mobile)
  if (phone)
    out.push({
      key: "phone",
      question: t("afqPhoneQ", [dr]),
      answer: t("afqPhoneA", [dr, phone]),
      link: { href: "#dr-address", label: t("afqLinkContact") },
    });

  // clinics / hospitals
  const places = names(facts.workplaces?.items);
  if (places.length)
    out.push({ key: "workplaces", question: t("afqWorkQ", [dr]), answer: t("afqWorkA", [dr, listOf(ctx, places)]) });

  // online visit
  if (facts.online) {
    const online = arr<VisitType>(facts.online.types).filter((x) => isVisitType(x) && x !== "inPerson");
    out.push({
      key: "online",
      question: t("afqOnlineQ", [dr]),
      answer: online.length
        ? t("afqOnlineYesA", [dr, listOf(ctx, online.map(typeLabel))])
        : t("afqOnlineNoA", [dr]),
      ...(online.length && { link: { href: "#dr-booking", label: t("afqLinkBook") } }),
    });
  }

  // nearest free time
  const ns = facts.nextSlot;
  if (ns) {
    if (!ns.none && ns.ymd && Number.isFinite(Number(ns.start)))
      out.push({
        key: "nextSlot",
        question: t("afqNextQ", [dr]),
        answer: t("afqNextA", [
          dayOf(ctx, ns.ymd),
          timeOf(ctx, Number(ns.start)),
          isVisitType(ns.type) ? typeLabel(ns.type) : "",
        ]),
        link: { href: "#dr-booking", label: t("afqLinkBook") },
      });
    else if (ns.none && Number(ns.days) > 0)
      out.push({
        key: "nextSlot",
        question: t("afqNextQ", [dr]),
        answer: t("afqNextNoneA", [numberOf(ctx, Number(ns.days)), dr]),
      });
  }

  // patient satisfaction
  const count = Number(facts.rating?.count) || 0;
  const average = Number(facts.rating?.average) || 0;
  if (count > 0 && average > 0)
    out.push({
      key: "rating",
      question: t("afqRatingQ", [dr]),
      answer: t("afqRatingA", [dr, numberOf(ctx, average, 1), numberOf(ctx, count), numberOf(ctx, 5)]),
      link: { href: "#dr-reviews", label: t("afqLinkReviews") },
    });

  // contracted insurers
  const insurers = names(facts.insurance?.items);
  if (insurers.length)
    out.push({ key: "insurance", question: t("afqInsQ", [dr]), answer: t("afqInsA", [dr, listOf(ctx, insurers)]) });

  return out;
};

// ------------------------------------------------------------ centres

export type CentreKind = "clinic" | "hospital" | "paraClinic" | "pharmacy";

// the parts of a centre's public response the questions read
export type CentreFaqData = {
  name?: string;
  address?: string;
  phone?: string;
  location?: { coordinates?: number[] } | null;
  city?: Named | string | null;
  province?: Named | string | null;
  isRoundTheClock?: boolean;
  openingHours?: unknown;
  businessTimes?: string;
  businessTime?: string;
  averageScore?: number;
  commentCount?: number;
  insurances?: unknown[];
  specialities?: unknown[];
  services?: unknown[];
  doctors?: unknown[];
  doctorsCount?: number;
  // a lab's live offers (name + price)
  tests?: unknown[];
  // a pharmacy / lab that takes online orders
  takesOrders?: boolean;
};

const nameOfRef = (v: unknown) => (v && typeof v === "object" ? str((v as Named).name) : "");

// "08:00–14:00، 16:00–20:00"
const rangesText = (ctx: FaqContext, ranges: { start: number; end: number }[]) =>
  listOf(
    ctx,
    ranges.map((r) => `${timeOf(ctx, r.start)}–${timeOf(ctx, r.end)}`),
  );

export const buildCentreFaq = (kind: CentreKind, data: CentreFaqData | null | undefined, ctx: FaqContext): Draft[] => {
  if (!data || typeof data !== "object") return [];
  const { t } = ctx;
  const name = str(data.name);
  if (!name) return [];
  const out: Draft[] = [];

  // address
  const address = str(data.address);
  if (address) {
    const city = nameOfRef(data.city) || nameOfRef(data.province);
    out.push({
      key: "address",
      question: t("afqCAddressQ", [name]),
      answer: sentences(t("afqCAddressA", [name, address]), !!city && !address.includes(city) && t("afqCityA", [city])),
      // the map block is drawn only for a centre with a point
      ...(arr(data.location?.coordinates).length === 2 && { link: { href: "#location", label: t("afqLinkMap") } }),
    });
  }

  // phone (the centre's public phone, shown in its contact block)
  const phone = str(data.phone);
  if (phone) out.push({ key: "phone", question: t("afqCPhoneQ", [name]), answer: t("afqPhoneA", [name, phone]) });

  // hours today
  const week = weekOf(data.openingHours);
  if (data.isRoundTheClock || isRoundTheClockWeek(week))
    out.push({ key: "hours", question: t("afqCHoursQ", [name]), answer: t("afqCHours24A", [name]) });
  else if (week) {
    const today = tehranYmd();
    const exception = exceptionsOf(data.openingHours).find((e) => e.date === today);
    const ranges = exception ? exception.ranges : week[tehranSaturdayDay()]?.ranges || [];
    out.push({
      key: "hours",
      question: t("afqCHoursQ", [name]),
      answer: ranges.length
        ? t("afqCHoursTodayA", [weekdayOf(ctx, today), rangesText(ctx, ranges)])
        : t("afqCHoursClosedA", [name, weekdayOf(ctx, today)]),
    });
  } else {
    const text = str(data.businessTimes) || str(data.businessTime);
    if (text) out.push({ key: "hours", question: t("afqCHoursQ", [name]), answer: t("afqCHoursTextA", [text]) });
  }

  // what it offers
  if (kind === "paraClinic") {
    const tests = arr<{ test?: Named; price?: number }>(data.tests)
      .filter((o) => str(o?.test?.name) && Number(o?.price) > 0)
      .slice(0, 6);
    if (tests.length)
      out.push({
        key: "tests",
        question: t("afqCTestsQ", [name]),
        answer: t("afqCTestsA", [
          name,
          uniq(tests.map((o) => t("afqFeeItem", [str(o.test?.name), tomanOf(ctx, Number(o.price))]))).join(blockSep(ctx)),
        ]),
        link: { href: "#Tests", label: t("afqLinkTests") },
      });
  }
  if (kind === "paraClinic" || kind === "pharmacy")
    if (typeof data.takesOrders === "boolean")
      out.push({
        key: "order",
        question: t("afqCOrderQ", [name]),
        answer: t(data.takesOrders ? "afqCOrderYesA" : "afqCOrderNoA", [name]),
      });
  if (kind === "clinic" || kind === "hospital") {
    const specialities = names(data.specialities);
    if (specialities.length)
      out.push({ key: "specialities", question: t("afqCSpecQ", [name]), answer: t("afqCSpecA", [name, listOf(ctx, specialities)]) });
    const services = arr<unknown>(data.services)
      .map((s) => (typeof s === "string" ? s.trim() : nameOfRef(s)))
      .filter(Boolean)
      .slice(0, 8);
    if (services.length)
      out.push({ key: "services", question: t("afqCServicesQ", [name]), answer: t("afqCServicesA", [name, listOf(ctx, services)]) });
  }

  // insurers
  const insurers = names(data.insurances);
  if (insurers.length)
    out.push({ key: "insurance", question: t("afqInsQ", [name]), answer: t("afqInsA", [name, listOf(ctx, insurers.slice(0, 8))]) });

  // rating (approved reviews)
  const count = Number(data.commentCount) || 0;
  const average = Number(data.averageScore) || 0;
  if (count > 0 && average > 0)
    out.push({
      key: "rating",
      question: t("afqRatingQ", [name]),
      answer: t("afqRatingA", [name, numberOf(ctx, average, 1), numberOf(ctx, count), numberOf(ctx, 5)]),
      link: {
        href: kind === "pharmacy" || kind === "paraClinic" ? "#Comment" : "#comments",
        label: t("afqLinkReviews"),
      },
    });

  // doctors working there
  if (kind === "clinic" || kind === "hospital") {
    const doctors = arr<{ doctor?: { firstName?: string; lastName?: string } }>(data.doctors)
      .map((m) => (m?.doctor && typeof m.doctor === "object" ? doctorDisplayName(ctx, m.doctor.firstName, m.doctor.lastName) : ""))
      .filter(Boolean);
    const total = Math.max(Number(data.doctorsCount) || 0, doctors.length);
    if (doctors.length)
      out.push({
        key: "doctors",
        question: t("afqCDoctorsQ", [name]),
        answer: t("afqCDoctorsA", [numberOf(ctx, total), name, listOf(ctx, doctors.slice(0, 5))]),
      });
  }

  return out;
};

// ------------------------------------------------------------ merging

export type MergedAutoFaq = FaqEntry & {
  key: string;
  // the automatic wording, for the panel's "reset" and comparison
  autoQuestion: string;
  autoAnswer: string;
  hidden: boolean;
  edited: boolean;
  // an own answer written against facts that have changed since
  stale: boolean;
};

// the provider's changes over the generated items: reworded text, hidden
// items, their order (an item never moved keeps its place after the moved
// ones); hidden ones are kept here for the panel
export const applyAutoFaqOverrides = (
  drafts: Draft[],
  overrides: AutoFaqOverride[] | undefined,
  hashes: Record<string, string> | undefined,
): MergedAutoFaq[] => {
  const byKey = new Map(arr<AutoFaqOverride>(overrides).filter((o) => o && o.key).map((o) => [o.key, o]));
  return drafts
    .map((d, i) => {
      const o = byKey.get(d.key);
      const customQ = str(o?.customQuestion);
      const customA = str(o?.customAnswer);
      return {
        ...d,
        id: `auto-${d.key}`,
        question: customQ || d.question,
        answer: customA || d.answer,
        autoQuestion: d.question,
        autoAnswer: d.answer,
        hidden: !!o?.hidden,
        edited: !!(customQ || customA),
        stale: !!customA && !!o?.factsHash && !!hashes?.[d.key] && hashes[d.key] !== o.factsHash,
        rank: Number.isFinite(Number(o?.order)) && o?.order !== null ? Number(o?.order) : 1000 + i,
      };
    })
    .sort((a, b) => a.rank - b.rank)
    .map(({ rank: _rank, ...rest }) => rest);
};

// the same question in two wordings ("?" / spacing / Arabic letters)
const normalizeQuestion = (q: string) =>
  q
    .toLowerCase()
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[‌‏‎]/g, "")
    .replace(/[\s?؟.!،,:؛;«»"'()-]+/g, "");

// what the page shows: the generated items, then the provider's own
// questions; an own question asking the same thing as a generated one is
// shown in its place (the provider's words win)
export const combineFaq = (
  auto: FaqEntry[],
  own: { _id?: string; question?: string; answer?: string }[] | undefined,
): FaqEntry[] => {
  const ownList: FaqEntry[] = arr<{ _id?: string; question?: string; answer?: string }>(own)
    .filter((f) => str(f?.question) && str(f?.answer))
    .map((f, i) => ({ id: String(f._id || `own-${i}`), question: str(f.question), answer: str(f.answer) }));
  const used = new Set<string>();
  const merged = auto.map((a) => {
    const twin = ownList.find((o) => !used.has(o.id) && normalizeQuestion(o.question) === normalizeQuestion(a.question));
    if (!twin) return a;
    used.add(twin.id);
    return twin;
  });
  return [...merged, ...ownList.filter((o) => !used.has(o.id))];
};

// the public list of a doctor page
export const doctorPageFaq = (
  payload: AutoFaqPayload | undefined,
  doctor: { firstName?: string; lastName?: string },
  own: { _id?: string; question?: string; answer?: string }[] | undefined,
  ctx: FaqContext,
): FaqEntry[] => {
  const auto = payload
    ? applyAutoFaqOverrides(buildDoctorFaq(payload.facts, doctor, ctx), payload.overrides, payload.hashes)
        .filter((i) => !i.hidden)
        .slice(0, MAX_AUTO_FAQ)
        .map(({ id, key, question, answer, link }) => ({ id, key, question, answer, ...(link && { link }) }))
    : [];
  return combineFaq(auto, own);
};

export const centrePageFaq = (kind: CentreKind, data: CentreFaqData | null | undefined, ctx: FaqContext): FaqEntry[] =>
  buildCentreFaq(kind, data, ctx)
    .slice(0, MAX_AUTO_FAQ)
    .map((d) => ({ ...d, id: `auto-${d.key}` }));

// ------------------------------------------------------------ structured data

export const faqPageSchema = (items: FaqEntry[], url?: string): Record<string, unknown> | null => {
  const list = items.filter((i) => str(i.question) && str(i.answer));
  if (!list.length) return null;
  return {
    "@type": "FAQPage",
    ...(url && { "@id": `${url}#faq` }),
    mainEntity: list.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.answer },
    })),
  };
};

const hasFaqPage = (node: unknown, depth = 0): boolean => {
  if (!node || typeof node !== "object" || depth > 6) return false;
  if (Array.isArray(node)) return node.some((n) => hasFaqPage(n, depth + 1));
  const type = (node as Record<string, unknown>)["@type"];
  if (type === "FAQPage" || (Array.isArray(type) && type.includes("FAQPage"))) return true;
  const graph = (node as Record<string, unknown>)["@graph"];
  return hasFaqPage(graph, depth + 1);
};

// the page's structured data with the FAQPage added (an @graph); a block
// the admin wrote with its own FAQPage is left as it is
export const withFaqPage = (
  schema: Record<string, unknown> | null | undefined,
  items: FaqEntry[],
  url?: string,
): Record<string, unknown> | null | undefined => {
  const faq = faqPageSchema(items, url);
  if (!faq) return schema;
  if (!schema || typeof schema !== "object") return { "@context": "https://schema.org", ...faq };
  if (hasFaqPage(schema)) return schema;
  const strip = (n: Record<string, unknown>) => {
    const { ["@context"]: _c, ...rest } = n;
    return rest;
  };
  const graph = Array.isArray(schema["@graph"])
    ? (schema["@graph"] as Record<string, unknown>[])
    : [strip(schema)];
  return { "@context": "https://schema.org", "@graph": [...graph, faq] };
};
