"use client";
import useSWR from "swr";
import { useState } from "react";
import classes from "./BecomeADoctorPage.module.css";
import { medicalSystemTitleKeys, medicalSystemTitles } from "./DoctorPanelPage";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import HandleLoading from "../Admin/UI/HandleLoading";
import { Population } from "../Admin/Clinic/AdminManageClinicsPage";
import { IUser, MongoDoc, UserPopulation } from "../Hooks/useUser";
import usePopup from "../Hooks/usePopup";
import useDoctor from "../Hooks/useDoctor";
import useNotification from "../Hooks/useNotification";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentKey } from "../Enums/contentKeys";
import { ContentNamespace } from "../Enums/contentNamespaces";
import Input from "../UI/Input";
import Button from "../UI/Button";
import SelectInput from "../UI/SelectInput";
import NodesSelector from "../UI/NodesSelector";
import ImageInput from "../UI/ImageInput";
import AreaInput from "../UI/AreaInput";
import Ixon from "../UI/Ixon";
import ClockSolidIcon from "../Icons/ClockSolidIcon";
import LogoutPopup from "../Popups/LogoutPopup";
import { t2xsRegular, tsmRegular, txlBold, txsRegular } from "../UI/Typography";
import BecomeDoneView from "../Become/BecomeDoneView";
import IdentityVerifyForm from "@/Components/_Common/Identity/IdentityVerifyForm";
import Link from "@/Components/i18n/Link";

const NS: ContentNamespace[] = ["common", "becomeSomething", "doctorPanelBecomeDoctor"];

// a council code the inquiry returned for the user (kept: the doctor profile
// still points to it, DoctorPanelPage's IDoctorProfile.mcCode)
export type McCodepopulation = Population<{ User: UserPopulation }>;
export interface IMcCode<
  T extends McCodepopulation = McCodepopulation,
> extends MongoDoc {
  user: T["User"] extends UserPopulation ? IUser<T["User"]> : string;
  mcCode: string;
  createdAt: Date;
  title?: string;
  city?: string;
  acquiredAt?: string;
}

// One doctor onboarding flow (2026-10, the Doctolib / Paziresh24 pattern;
// backend Controllers/doctorOnboardingController.ts): 1) the council code is
// checked against the verified national id (by hand if the council's
// service is down, flagged for the admin), 2) the council card and the
// optional licences plus the confirmed speciality, 3) one request the admin
// approves or rejects with a reason - the applicant sees it here and can
// send it again. It replaces the old request form and the self-service
// inquiry that created a profile with no review.
const stages = ["inquiry", "documents", "review"] as const;
type Stage = (typeof stages)[number];
const stageKeys: Record<Stage, ContentKey> = {
  inquiry: "inquiryDetails",
  documents: "doctorOnboardDocsStep",
  review: "finalizeRegister",
};

type Speciality = { _id: string; name?: string };
type ClaimPage = { _id: string; firstName?: string; lastName?: string; slug?: string; speciality?: string };

type Onboarding = {
  identity: { nationalId: string; firstName: string; lastName: string } | null;
  request: {
    _id: string;
    status: "Pending" | "Rejected" | "Approved";
    rejectReason?: string;
    medicalSystemCode?: string;
    medicalSystemTitle?: string;
    verification?: "inquiry" | "manual";
    council?: { title?: string };
    specialities?: Speciality[];
    claimProfile?: ClaimPage | null;
    description?: string;
    documents?: string[];
  } | null;
  hasProfile: boolean;
};

type Inquiry = {
  mcCode: string;
  verification: "inquiry" | "manual";
  council: { title?: string; city?: string; acquiredAt?: string };
  firstName: string;
  lastName: string;
  speciality: Speciality | null;
  claimable: ClaimPage | null;
};

const docFields = ["councilCard", "licenseDoc", "officePermit"] as const;
type DocField = (typeof docFields)[number];
const docKeys: Record<DocField, ContentKey> = {
  councilCard: "councilCardImage",
  licenseDoc: "licenseDocImage",
  officePermit: "officePermitImage",
};

const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e));

const Stepper = ({ stage }: { stage: Stage }) => {
  const getContent = useScopedLocale(NS);
  return (
    <div className={classes.tabs}>
      {stages.map((s, i) => (
        <div
          className={`${classes.stage} ${tsmRegular} ${stages.indexOf(stage) >= i ? classes.activeStage : ""}`}
          key={s}
        >
          <span>{i + 1}</span>
          <span>{getContent(stageKeys[s])}</span>
        </div>
      ))}
    </div>
  );
};

const InquiryStage = ({
  nationalId,
  defaultCode,
  onDone,
}: {
  nationalId: string;
  defaultCode?: string;
  onDone: (inquiry: Inquiry) => unknown;
}) => {
  const getContent = useScopedLocale(NS);
  const { setPopup } = usePopup();
  const pushNotification = useNotification();
  const [code, setCode] = useState(defaultCode || "");
  const [busy, setBusy] = useState(false);

  const inquire = async () => {
    if (busy || !code.trim()) return;
    setBusy(true);
    try {
      const res = await fetcher<{ data: Inquiry }>({
        url: `${API}/doctor/onboarding/inquiry`,
        method: "POST",
        payload: { mcCode: code.trim() },
      });
      if (res?.data) onDone(res.data);
    } catch (e) {
      pushNotification(errorText(e), "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={classes.form}>
      <Input readOnly defaultValue={nationalId} title={getContent("nationalId")} />
      <Input
        title={getContent("medicalSystemCode")}
        defaultValue={defaultCode}
        inputMode="numeric"
        onChange={(e) => setCode(e.target.value)}
        readOnly={busy}
        required
      />
      <div className={classes.actions}>
        <Button
          onClick={() => setPopup("Logout", <LogoutPopup />)}
          variant="Error"
          mode="Outline"
          radius="High"
          size="L"
        >
          {getContent("logout")}
        </Button>
        <Button
          variant={code.trim() ? "Primary" : "Disable"}
          mode="Fill"
          radius="High"
          size="L"
          isLoading={busy}
          onClick={inquire}
        >
          {getContent("inquiryAndContinue")}
        </Button>
        <span className={`${classes.notice} ${t2xsRegular}`}>
          {getContent("becomeDoctorInquiryNotice")}
        </span>
      </div>
    </div>
  );
};

const DocumentsStage = ({
  inquiry,
  previous,
  onBack,
  onDone,
}: {
  inquiry: Inquiry;
  previous: Onboarding["request"];
  onBack: () => unknown;
  onDone: () => unknown;
}) => {
  const getContent = useScopedLocale(NS);
  const pushNotification = useNotification();
  const kept = new Set(previous?.documents || []);
  const firstSpecs = inquiry.speciality
    ? [inquiry.speciality._id]
    : (previous?.specialities || []).map((s) => s._id).filter(Boolean);
  const [specialities, setSpecialities] = useState<string[]>(firstSpecs);
  const [title, setTitle] = useState<string>(
    previous?.medicalSystemTitle || medicalSystemTitles[1],
  );
  const [files, setFiles] = useState<Partial<Record<DocField, File>>>({});
  const [description, setDescription] = useState(previous?.description || "");
  const [busy, setBusy] = useState(false);

  const ready = !!specialities.length && !!title && (!!files.councilCard || kept.has("councilCard"));

  const submit = async () => {
    if (busy) return;
    if (!ready) return pushNotification(getContent("checkInput"), "Error");
    setBusy(true);
    try {
      await fetcher({
        url: `${API}/doctor/onboarding`,
        method: "POST",
        bodyParser: "FORM",
        payload: {
          mcCode: inquiry.mcCode,
          medicalSystemTitle: title,
          specialities,
          ...(description.trim() ? { description: description.trim() } : {}),
          ...files,
        },
      });
      onDone();
    } catch (e) {
      pushNotification(errorText(e), "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={classes.confirm}>
      <p
        className={`${classes.callout} ${inquiry.verification === "inquiry" ? classes.calloutOk : classes.calloutWarn} ${txsRegular}`}
      >
        {getContent(inquiry.verification === "inquiry" ? "doctorOnboardVerified" : "doctorOnboardManualNotice")}
      </p>
      <div className={classes.wrap}>
        <Input title={getContent("firstName")} readOnly defaultValue={inquiry.firstName} />
        <Input title={getContent("lastName")} readOnly defaultValue={inquiry.lastName} />
      </div>
      <div className={classes.wrap}>
        <Input title={getContent("medicalSystemCode")} readOnly defaultValue={inquiry.mcCode} />
        {!!inquiry.council?.title && (
          <Input title={getContent("mcTitle")} readOnly defaultValue={inquiry.council.title} />
        )}
      </div>
      {!!inquiry.claimable && (
        <div className={classes.claim}>
          <strong className={tsmRegular}>{getContent("doctorOnboardClaimTitle")}</strong>
          <span className={txsRegular}>
            {[inquiry.claimable.firstName, inquiry.claimable.lastName].filter(Boolean).join(" ")}
            {inquiry.claimable.speciality ? ` · ${inquiry.claimable.speciality}` : ""}
          </span>
          <span className={`${classes.notice} ${t2xsRegular}`}>{getContent("doctorOnboardClaimLegend")}</span>
          {!!inquiry.claimable.slug && (
            <Link className={classes.link} href={`/dr/${inquiry.claimable.slug}`} target="_blank">
              {getContent("doctorOnboardViewPage")}
            </Link>
          )}
        </div>
      )}
      <div className={classes.wrap}>
        <SelectInput
          title={getContent("medicalSystemTitle")}
          defaultValue={title}
          readOnly={busy}
          onChange={(e) => setTitle(e.target.value)}
          options={medicalSystemTitles.reduce(
            (acc, el) => ({ ...acc, [el]: getContent(medicalSystemTitleKeys[el]) }),
            {} as Record<string, string>,
          )}
        />
        <NodesSelector<true>
          multi
          title={getContent("specialities")}
          path={`${API}/public/selectspeciality`}
          defaultValue={firstSpecs}
          readOnly={busy}
          getOptionLabel={(node) => (node as Speciality).name || (node as Speciality)._id}
          getOptionValue={(node) => (node as Speciality)._id}
          onChange={(ids) => setSpecialities(Array.isArray(ids) ? ids : [])}
        />
      </div>
      <div className={classes.docs}>
        {docFields.map((field) => (
          <div key={field} className={classes.doc}>
            <ImageInput
              title={getContent(docKeys[field])}
              required={field === "councilCard"}
              readOnly={busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                setFiles((prev) => ({ ...prev, [field]: file }));
              }}
            />
            {kept.has(field) && !files[field] && (
              <span className={`${classes.notice} ${t2xsRegular}`}>{getContent("doctorOnboardDocKept")}</span>
            )}
          </div>
        ))}
      </div>
      <AreaInput
        title={getContent("description")}
        defaultValue={description}
        readOnly={busy}
        onChange={(e) => setDescription(e.target.value)}
      />
      <p className={`${classes.notice} ${t2xsRegular}`}>{getContent("doctorOnboardDraftNotice")}</p>
      <div className={classes.row}>
        <Button variant="Primary" mode="Outline" radius="High" size="L" onClick={onBack} type="button">
          {getContent("back")}
        </Button>
        <Button
          variant={ready ? "Primary" : "Disable"}
          mode="Fill"
          radius="High"
          size="L"
          isLoading={busy}
          onClick={submit}
        >
          {getContent("doctorOnboardSubmit")}
        </Button>
      </div>
    </div>
  );
};

const PendingView = ({ request }: { request: NonNullable<Onboarding["request"]> }) => {
  const getContent = useScopedLocale(NS);
  return (
    <div className={classes.pending}>
      <div className={`${classes.icon} glassIcon tone-amber`}>
        <Ixon width="1.5rem">
          <ClockSolidIcon />
        </Ixon>
      </div>
      <h2 className={`${classes.title} ${txlBold}`}>{getContent("pendingApplicationTitle")}</h2>
      <p className={`${classes.notice} ${txsRegular}`}>{getContent("becomeDoctorDone")}</p>
      <p className={`${classes.notice} ${t2xsRegular}`}>
        {getContent("medicalSystemCode")}: {request.medicalSystemCode || "-"}
        {request.verification === "manual" ? ` · ${getContent("doctorOnboardManualShort")}` : ""}
      </p>
      <div className={classes.row}>
        <Button href="/" variant="Primary" mode="Outline" radius="High" size="L">
          {getContent("goHomePage")}
        </Button>
      </div>
    </div>
  );
};

const BecomeADoctorPage = () => {
  const getContent = useScopedLocale(NS);
  const { doctor, isLoading: doctorLoading, mutate: mutateDoctor } = useDoctor();
  const { data, error, mutate } = useSWR<Onboarding | null>(
    `${API}/doctor/onboarding`,
    (url: string) => fetcher<{ data: Onboarding }>({ url }).then((res) => res?.data ?? null),
  );
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);

  if (doctor || data?.hasProfile)
    return (
      <div className={classes.main}>
        <BecomeDoneView title="becomeDoctorActive" target="/doctorpanel" />
      </div>
    );

  const request = data?.request ?? null;
  const pending = request?.status === "Pending";
  const rejected = request?.status === "Rejected";
  const stage: Stage = pending ? "review" : inquiry ? "documents" : "inquiry";

  return (
    <HandleLoading data={!doctorLoading && data !== undefined} error={error}>
      <div className={classes.main}>
        <Stepper stage={stage} />
        {!data?.identity ? (
          // no verified identity yet (e.g. an account from the old site):
          // verify it here - the profile's name comes from it
          <IdentityVerifyForm onDone={() => mutate()} />
        ) : pending && request ? (
          <PendingView request={request} />
        ) : (
          <>
            {rejected && (
              <div className={classes.rejected}>
                <h2 className={`${classes.title} ${txlBold}`}>{getContent("rejectedApplicationTitle")}</h2>
                <p className={`${classes.notice} ${txsRegular}`}>
                  {request?.rejectReason?.trim()
                    ? getContent("rejectedApplicationReason", [request.rejectReason.trim()])
                    : getContent("rejectedApplicationLegend")}
                </p>
              </div>
            )}
            {!inquiry ? (
              <InquiryStage
                nationalId={data.identity.nationalId}
                defaultCode={request?.medicalSystemCode}
                onDone={setInquiry}
              />
            ) : (
              <DocumentsStage
                inquiry={inquiry}
                previous={request}
                onBack={() => setInquiry(null)}
                onDone={async () => {
                  setInquiry(null);
                  await mutate();
                  mutateDoctor();
                }}
              />
            )}
          </>
        )}
      </div>
    </HandleLoading>
  );
};

export default BecomeADoctorPage;
