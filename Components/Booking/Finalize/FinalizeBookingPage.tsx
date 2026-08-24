"use client";
import { useParams, useSearchParams } from "next/navigation";
import classes from "./FinalizeBookingPage.module.css";
import useSWR from "swr";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import HostedImage from "@/Components/UI/HostedImage";
import { getDoctorProfileLabel } from "@/Components/Admin/Lib/LabelGetters";
import {
  Dispatch,
  Fragment,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DoctorShiftPopulation,
  IDoctorShift,
  ShiftContext,
} from "@/Components/DoctorPanel/Shift/DoctorManageShiftsPage";
import useProgress from "@/Components/Hooks/useProgress";
import useShiftUtils from "@/Components/DoctorPanel/Shift/useShiftUtils";
import ErrorMessage from "@/Components/Admin/UI/ErrorMessage";
import useLocale from "@/Components/Hooks/useLocale";
import useComplexLocale from "@/Components/Hooks/useComplexLocale";
import { numberToTime } from "@/Components/DoctorPanel/Calendar/AddSessionsAgent";
import useUser, {
  IUser,
  MongoDoc,
  UserPopulation,
} from "@/Components/Hooks/useUser";
import { IUserIdentity } from "@/Components/Dashboard/DashboardPage";
import Loading from "@/Components/Admin/UI/Loading";
import {
  DoctorSessionType,
  doctorSessionTypes,
} from "@/Components/DoctorPanel/Calendar/DoctorCalendarDay";
import Ixon from "@/Components/UI/Ixon";
import CheckIcon from "@/Components/Icons/CheckIcon";
import Tick02Icon from "@/Components/Icons/Tick02Icon";
import Button from "@/Components/UI/Button";
import ChevronIcon from "@/Components/Icons/ChevronIcon";
import useNotification from "@/Components/Hooks/useNotification";
import { paymentMethods } from "../SelectSessionToReservePopup";
import WalletIcon from "@/Components/Icons/WalletIcon";
import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import {
  t2xsMedium,
  t2xsRegular,
  tbaseDemiBold,
  tbaseMedium,
  tsmDemiBold,
  tsmMedium,
  txsDemiBold,
  txsRegular,
} from "@/Components/UI/Typography";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import Input from "@/Components/UI/Input";
import Form from "@/Components/UI/Form";
import DateInput from "@/Components/UI/DateInput";
import useForm from "@/Components/Hooks/useForm";
import AlertTriangleIcon from "@/Components/Icons/AlertTriangleIcon";
import Act from "@/Components/UI/Act";
import { IReservation } from "@/Components/Dashboard/Booking/DashboardManageBookingsPage";

const AddRelativePopup = ({ mutate }: { mutate: () => unknown }) => {
  const getContent = useLocale();

  const { closePopup } = usePopup();

  const { setInput, isLoading, submit } = useForm<{
    nationalCode: string;
    birthDate: Date;
    phone: string;
  }>({
    path: `${API}/user/relative`,
    method: "POST",
    successCb: () => {
      mutate();
      closePopup();
    },
  });

  return (
    <PopupCard title={getContent("addRelative")}>
      <Form className={classes.addRelative} onSubmit={submit}>
        <Input
          title={getContent("nationalCode")}
          onChange={(e) =>
            setInput((prev) => ({ ...prev, nationalCode: e.target.value }))
          }
        />
        <DateInput
          title={getContent("dateOfBirth")}
          onChange={(e) => setInput((prev) => ({ ...prev, birthDate: e }))}
        />
        <Input
          title={getContent("phoneNumber")}
          onChange={(e) =>
            setInput((prev) => ({ ...prev, phone: e.target.value }))
          }
        />
        <Button type="submit" isLoading={isLoading}>
          {getContent("submit")}
        </Button>
      </Form>
    </PopupCard>
  );
};

const PatientStage = ({
  selfIdentity,
  context,
  setContext,
  setStage,
}: {
  selfIdentity: IUserIdentity;
  context: FinalizeBookingContext;
  setContext: Dispatch<SetStateAction<FinalizeBookingContext>>;
  setStage: Dispatch<SetStateAction<BookingStage>>;
}) => {
  const { data, error, mutate } = useSWR<IUserIdentity[]>(
    `${API}/user/relative`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const [didConsent, setDidConsent] = useState<boolean>(false);

  const { user } = useUser();

  const getContent = useLocale();

  const push = useProgress();

  const pushNotification = useNotification();

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.box}>
          <span
            className={`${classes.title} ${classes.patientTitle} ${tbaseMedium}`}
          >
            {getContent("selectPatient")}
          </span>
          <div className={classes.identityList}>
            {[selfIdentity, ...data].map((identity) => (
              <div
                className={`${classes.identity} ${context.patient._id === identity._id ? classes.activeIdentity : ""}`}
                key={identity._id}
              >
                <div className={classes.identityCheck}>
                  <Ixon width=".75rem">
                    <CheckIcon />
                  </Ixon>
                </div>
                <div className={classes.identityDetails}>
                  <span
                    className={`${classes.identityName} ${tbaseMedium}`}
                  >{`${identity.givenName} ${identity.lastName}`}</span>
                  <span className={classes.identityPhone}>
                    {identity.phones[0] || user?.phone}
                  </span>
                </div>
              </div>
            ))}
            <Button
              className={classes.newPatient}
              variant="Primary"
              mode="Outline"
              radius="Medium"
              onClick={() =>
                setPopup("AddRelative", <AddRelativePopup mutate={mutate} />)
              }
            >
              {getContent("reserveBookingForOther")}
            </Button>
          </div>
          <div
            className={`${classes.consent} ${didConsent ? classes.activeConsent : ""}`}
            onClick={() => setDidConsent((prev) => !prev)}
          >
            <div className={classes.consentCheck}>
              <Ixon width=".75rem">
                <Tick02Icon />
              </Ixon>
            </div>
            <span>{getContent("iConsentToPolicy")}</span>
          </div>
          <div className={`${classes.actions} ${classes.patientActions}`}>
            <Button
              onClick={() => push("/book")}
              tailIcon={
                <Ixon style={{ transform: "rotateZ(90deg)" }}>
                  <ChevronIcon />
                </Ixon>
              }
              variant="Neutral"
              mode="Inline"
              size="M"
              radius="High"
            >
              {getContent("previousStage")}
            </Button>
            <Button
              size="M"
              radius="High"
              mode="Fill"
              variant="Primary"
              onClick={() => {
                if (!didConsent)
                  return pushNotification(getContent("consentFirst"));
                setStage("Session");
              }}
            >
              {getContent("confirmAndContinue")}
            </Button>
          </div>
        </div>
      )}
    </HandleLoading>
  );
};

const SessionTypeStage = ({
  context,
  setContext,
  setStage,
  doctor,
  shift,
}: {
  context: FinalizeBookingContext;
  setContext: Dispatch<SetStateAction<FinalizeBookingContext>>;
  setStage: Dispatch<SetStateAction<BookingStage>>;
  doctor: FinalizeBookingDoctor;
  shift: IDoctorShift<{ Office: Record<never, never> }>;
}) => {
  const getContent = useLocale();

  const getCompContent = useComplexLocale();

  const sessionTypeAvailable = useCallback(
    (st: DoctorSessionType): boolean => {
      if (!shift.sessionTypes.includes(st)) return false;
      switch (st) {
        case "inPerson":
          return (
            !!doctor.inPersonSettings?.price && doctor.inPersonSettings.active
          );
        case "sipCall":
          return (
            !!doctor.sipCallSettings?.price && doctor.sipCallSettings.active
          );
        case "textChat":
          return (
            !!doctor.textChatSettings?.price && doctor.textChatSettings.active
          );
        case "voiceCall":
          return (
            !!doctor.phoneConsultSettings?.price &&
            doctor.phoneConsultSettings.active
          );
        case "videoCall":
          return (
            !!doctor.videoCallSettings?.price && doctor.videoCallSettings.active
          );
        default:
          return false;
      }
    },
    [doctor, shift.sessionTypes],
  );

  const getSessionTypePrice = useCallback(
    (st: DoctorSessionType): number => {
      switch (st) {
        case "inPerson":
          return doctor.inPersonSettings?.price || 0;
        case "textChat":
          return doctor.textChatSettings?.price || 0;
        case "sipCall":
          return doctor.sipCallSettings?.price || 0;
        case "voiceCall":
          return doctor.phoneConsultSettings?.price || 0;
        case "videoCall":
          return doctor.videoCallSettings?.price || 0;
        default:
          return 0;
      }
    },
    [doctor],
  );

  const pushNotification = useNotification();

  return (
    <div className={classes.box}>
      <span className={`${classes.title} ${classes.sessionsTitle}`}>
        {getContent("selectSessionType")}
      </span>
      <div className={classes.sessionsList}>
        {doctorSessionTypes.map((st) => (
          <Fragment key={st}>
            {sessionTypeAvailable(st) ? (
              <div
                className={`${classes.sessionType} ${context.sessionType === st ? classes.activeSessionType : ""}`}
                onClick={() =>
                  setContext((prev) => ({ ...prev, sessionType: st }))
                }
              >
                <div className={classes.sessionTypeCheck}>
                  <Ixon width=".75rem">
                    <CheckIcon />
                  </Ixon>
                </div>
                <span className={`${classes.sessionTypeTitle} ${txsRegular}`}>
                  {getContent(st)}
                </span>
                <span
                  className={`${classes.sessionTypeDuration} ${t2xsMedium}`}
                >
                  {st === "inPerson"
                    ? shift.office.name
                    : getCompContent("xMinutes", [shift.duration.toString()])}
                </span>
                <span className={`${classes.sessionTypePrice} ${t2xsMedium}`}>
                  {getSessionTypePrice(st)}
                </span>
              </div>
            ) : null}
          </Fragment>
        ))}
      </div>
      <div className={classes.actions}>
        <Button
          onClick={() => setStage("Patient")}
          tailIcon={
            <Ixon style={{ transform: "rotateZ(90deg)" }}>
              <ChevronIcon />
            </Ixon>
          }
          variant="Neutral"
          mode="Inline"
          size="M"
          radius="High"
        >
          {getContent("previousStage")}
        </Button>
        <Button
          size="M"
          radius="High"
          mode="Fill"
          variant="Primary"
          onClick={() => {
            if (!context.sessionType)
              return pushNotification(getContent("checkInput"));
            setStage("Checkout");
          }}
        >
          {getContent("confirmAndContinue")}
        </Button>
      </div>
    </div>
  );
};

const methodIcons: Record<CheckoutOption, ReactNode> = {
  wallet: <WalletIcon />,
};

export type WalletPopulation = Population<{ User: UserPopulation }>;

export interface IWallet<
  T extends WalletPopulation = WalletPopulation,
> extends MongoDoc {
  user: T["User"] extends UserPopulation ? IUser<T["User"]> : string;
  balance: number;
}

const CheckoutStage = ({
  context,
  doctor,
  setContext,
  onFinalize,
}: {
  context: FinalizeBookingContext;
  setContext: Dispatch<SetStateAction<FinalizeBookingContext>>;
  doctor: FinalizeBookingDoctor;
  setStage: Dispatch<SetStateAction<BookingStage>>;
  onFinalize: () => unknown;
}) => {
  const getContent = useLocale();
  const getCompContent = useComplexLocale();
  const { data: wallet, error } = useSWR<IWallet>(
    `${API}/user/wallet`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const getSessionTypePrice = useCallback(
    (st: DoctorSessionType): number => {
      switch (st) {
        case "inPerson":
          return doctor.inPersonSettings?.price || 0;
        case "textChat":
          return doctor.textChatSettings?.price || 0;
        case "sipCall":
          return doctor.sipCallSettings?.price || 0;
        case "voiceCall":
          return doctor.phoneConsultSettings?.price || 0;
        case "videoCall":
          return doctor.videoCallSettings?.price || 0;
        default:
          return 0;
      }
    },
    [
      doctor.inPersonSettings?.price,
      doctor.phoneConsultSettings?.price,
      doctor.sipCallSettings?.price,
      doctor.textChatSettings?.price,
      doctor.videoCallSettings?.price,
    ],
  );

  if (!context.sessionType || !wallet) return <Loading />;
  return (
    <div className={classes.boxs}>
      <div className={classes.box}>
        <div className={classes.paymentInfo}>
          <span className={`${classes.title} ${classes.paymentInfoTitle}`}>
            {getContent("paymentDetails")}
          </span>
          <div className={classes.paymentDetails}>
            <div className={`${classes.paymentDetail} ${tsmMedium}`}>
              <span>{getContent("tax")}</span>
              <span>{getContent("freeOfCharge")}</span>
            </div>
            <div className={`${classes.paymentDetail} ${tsmMedium}`}>
              <span>{getContent("downPayment")}</span>
              <span>
                {getCompContent("xToman", [
                  getSessionTypePrice(context.sessionType).toString(),
                ])}
              </span>
            </div>
          </div>
          <div className={classes.totalBox}>
            <span className={`${classes.totalLabel} ${tbaseDemiBold}`}>
              {getContent("totalPrice")}
            </span>
            <span className={`${classes.totalValue} ${tbaseDemiBold}`}>
              {getCompContent("xToman", [
                getSessionTypePrice(context.sessionType).toString(),
              ])}
            </span>
          </div>
        </div>
      </div>
      <div className={classes.box}>
        <span className={classes.title}>{getContent("paymentMethod")}</span>
        <div className={classes.methods}>
          {checkoutOptions.map((method) => (
            <div
              key={method}
              onClick={() =>
                setContext((prev) => ({ ...prev, checkout: method }))
              }
              className={`${classes.method} ${method === context.checkout ? classes.activeMethod : ""}`}
            >
              <div className={classes.methodIcon}>
                <Ixon width="1.5rem">{methodIcons[method]}</Ixon>
              </div>
              <span className={classes.methodName}>{getContent(method)}</span>
              <div className={classes.methodTail}>
                {method === "wallet" && (
                  <div className={`${classes.balance} ${t2xsRegular}`}>
                    {`${getContent("balance")}: ${getCompContent("xToman", [wallet.balance.toString()])}`}
                  </div>
                )}
                <div className={classes.methodCheck}>
                  <Ixon width="1rem">
                    <CheckIcon />
                  </Ixon>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={classes.tips}>
        <div className={classes.tipsHeader}>
          <Ixon className={classes.tipsIcon} width="1.5rem">
            <AlertTriangleIcon />
          </Ixon>
          <span className={tsmDemiBold}>{getContent("importantTips")}</span>
        </div>
        <div className={classes.tipsList}>
          <p className={`${classes.tip} ${tsmDemiBold}`}>
            {getContent("bookingTip1")}
          </p>
          <p className={`${classes.tip} ${tsmDemiBold}`}>
            {getContent("bookingTip2")}
          </p>
        </div>
      </div>
      <Button
        className={classes.finalize}
        radius="Medium"
        variant="Primary"
        mode="Fill"
        size="M"
        onClick={onFinalize}
      >
        {getContent("payAndReserveBooking")}
      </Button>
    </div>
  );
};

const bookingStages = ["Patient", "Session", "Checkout"] as const;

type BookingStage = (typeof bookingStages)[number];

const checkoutOptions = ["wallet"] as const;

type CheckoutOption = (typeof checkoutOptions)[number];

const Pair = ({ title, value }: { title: string; value: string }) => {
  return (
    <div className={classes.pair}>
      <span className={`${classes.pairTitle} ${txsRegular}`}>{title}</span>
      <span className={`${classes.pairValue} ${txsDemiBold}`}>{value}</span>
    </div>
  );
};

type FinalizeBookingContext = {
  patient: IUserIdentity;
  sessionType: DoctorSessionType | null;
  checkout: CheckoutOption;
};

type FinalizeBookingDoctor = IDoctorProfile<{
  Shifts: { Office: Record<never, never> };
  MainSpecialityPopulated: Record<never, never>;
  SipCallSettings: Record<never, never>;
  InPersonSettings: Record<never, never>;
  TextChatSettings: Record<never, never>;
  VideoCallSettings: Record<never, never>;
  PhoneConsultSettingsPopulated: Record<never, never>;
}>;

const Inner = ({
  date,
  end,
  start,
  identity,
}: {
  date: Date;
  start: number;
  end: number;
  identity: IUserIdentity;
}) => {
  const { user } = useUser();

  const { nodeId } = useParams<{ nodeId: string }>();

  const [doesntExist, setDoesntExist] = useState<boolean>(false);

  const { data, error } = useSWR<FinalizeBookingDoctor>(
    `${API}/public/dr/${nodeId}/id`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const getContent = useLocale();

  const getCompContent = useComplexLocale();

  const { getShiftSessionBounds } = useShiftUtils();

  //TODO: add logic if session is booked
  const shift = useMemo<IDoctorShift<{
    Office: Record<never, never>;
  }> | null>(() => {
    if (!data) return null;
    const thisDayOfWeek = (date.getDay() + 1) % 7;
    const target = data.shifts.find(
      (shift) =>
        shift.day === thisDayOfWeek && shift.start <= start && shift.end >= end,
    );
    if (!target) {
      setDoesntExist(true);
      return null;
    }
    const bounds = getShiftSessionBounds(
      target as unknown as ShiftContext[number],
    );
    const bound = bounds.find((b) => b[0] === start && b[1] === end);
    if (!bound) {
      setDoesntExist(true);
      return null;
    }
    return target;
  }, [data, date, end, getShiftSessionBounds, start]);

  const [stage, setStage] = useState<BookingStage>("Patient");

  const [context, setContext] = useState<FinalizeBookingContext>({
    checkout: "wallet",
    sessionType: null,
    patient: identity,
  });

  const pushNotification = useNotification();

  const [isLoading, setIsLoading] = useState<{
    doctor: string;
    date: Date;
    start: number;
    end: number;
    sessionType: DoctorSessionType;
    patient: string;
    method: CheckoutOption;
  } | null>(null);

  const onFinalize = useCallback(() => {
    if (!!isLoading || !data) return;
    if (!context.sessionType || !context.patient || !context.checkout)
      return pushNotification(getContent("checkInput"), "Warn");
    setIsLoading({
      date,
      start,
      end,
      method: context.checkout,
      doctor: data._id,
      patient: context.patient._id,
      sessionType: context.sessionType,
    });
  }, [
    context.checkout,
    context.patient,
    context.sessionType,
    data,
    date,
    end,
    getContent,
    isLoading,
    pushNotification,
    start,
  ]);

  const stageDict = useMemo<Record<BookingStage, ReactNode>>(
    () =>
      !!data && !!shift
        ? {
            Session: (
              <SessionTypeStage
                context={context}
                setContext={setContext}
                doctor={data}
                setStage={setStage}
                shift={shift}
              />
            ),
            Checkout: (
              <CheckoutStage
                context={context}
                setContext={setContext}
                doctor={data}
                setStage={setStage}
                onFinalize={onFinalize}
              />
            ),
            Patient: (
              <PatientStage
                selfIdentity={identity}
                context={context}
                setContext={setContext}
                setStage={setStage}
              />
            ),
          }
        : { Checkout: <Loading />, Patient: <Loading />, Session: <Loading /> },
    [context, data, identity, onFinalize, shift],
  );

  const push = useProgress();

  return (
    <HandleLoading data={!!data && !!user} error={error}>
      {!!data && !!user && (
        <Fragment>
          {!!shift ? (
            <div className={classes.main}>
              <div className={classes.var}>{stageDict[stage]}</div>
              <div className={classes.detail}>
                <div className={classes.doctor}>
                  <div className={classes.doctorImage}>
                    <HostedImage
                      src={data.avatar}
                      alt={getDoctorProfileLabel(data)}
                      fill
                      sizes="4rem"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className={classes.doctorDetails}>
                    <span className={`${classes.doctorName} ${tsmDemiBold}`}>
                      {getDoctorProfileLabel(data)}
                    </span>
                    {!!data.mainSpeciality && (
                      <span
                        className={`${classes.doctorSpeciality} ${txsRegular}`}
                      >
                        {data.mainSpeciality.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className={classes.sessionDetails}>
                  <Pair
                    title={getContent("sessionOffice")}
                    value={shift.office.name || "-"}
                  />
                  <Pair
                    title={getContent("sessionTime")}
                    value={`${date.toLocaleDateString("fa-IR", { month: "long", day: "numeric" })} ${getCompContent("fromTimeXtoTimeY", [numberToTime(start), numberToTime(end)])}`}
                  />
                </div>
              </div>
            </div>
          ) : (
            <Fragment>
              {doesntExist ? (
                <ErrorMessage message={getContent("shiftDoesNotExist")} />
              ) : (
                <Loading />
              )}
            </Fragment>
          )}
        </Fragment>
      )}
      <Act<{ data: IReservation }>
        path={!!isLoading ? `${API}/booking/reserve` : null}
        method="POST"
        payload={isLoading || undefined}
        onDone={(status, result) => {
          setIsLoading(null);
          if (!status || !result) return;
          push(`/dashboard/booking/${result.data._id}`);
        }}
      />
    </HandleLoading>
  );
};

const FinalizeBookingPage = () => {
  const searchParams = useSearchParams();

  const { data: identity, error: identityError } = useSWR<IUserIdentity>(
    `${API}/user/identity`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const [data, setData] = useState<{
    date: Date;
    end: number;
    start: number;
  } | null>(null);

  const push = useProgress();

  const todayStart = useMemo<Date>(() => {
    const then = new Date();
    then.setHours(0);
    then.setMinutes(0);
    then.setSeconds(0);
    then.setMilliseconds(0);
    return then;
  }, []);

  useEffect(() => {
    const _date = searchParams.get("d");
    const _start = searchParams.get("s");
    const _end = searchParams.get("e");
    if (!_date || !_start || !_end) return push("/book");
    // Parse the YYYY-MM-DD key as local midnight explicitly. `new Date(_date)`
    // would parse a date-only string as UTC midnight, which drifts from
    // local midnight (and from `todayStart`) by the timezone offset.
    const [dYear, dMonth, dDay] = _date.split("-").map(Number);
    const date = new Date(dYear, (dMonth || 1) - 1, dDay || 1);
    const start = Number(_start);
    const end = Number(_end);
    const now = new Date();
    const isToday = date.getTime() === todayStart.getTime();
    if (
      isNaN(date.getTime()) ||
      isNaN(start) ||
      isNaN(end) ||
      date < todayStart ||
      start >= end ||
      start < 0 ||
      start > 24 * 60 ||
      end < 0 ||
      end > 24 * 60 ||
      (isToday && start <= now.getHours() * 60 + now.getMinutes())
    )
      return push("/book");
    setData({ date, end, start });
  }, [push, searchParams, todayStart]);

  return (
    <HandleLoading data={!!data && !!identity}>
      {!!data && !!identity && <Inner identity={identity} {...data} />}
    </HandleLoading>
  );
};

export default FinalizeBookingPage;
