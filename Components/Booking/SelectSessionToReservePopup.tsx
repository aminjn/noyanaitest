import useSWR from "swr";
import classes from "./SelectSessionToReservePopup.module.css";
import {
  DoctorSessionPopulation,
  DoctorSessionType,
  doctorSessionTypes,
  IDoctorSession,
} from "../DoctorPanel/Calendar/DoctorCalendarDay";
import { fetcher } from "../helpers/fetcher";
import HandleLoading from "../Admin/UI/HandleLoading";
import { API } from "../config";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import { Fragment, useEffect, useState } from "react";
import { numberToTime } from "../DoctorPanel/Calendar/AddSessionsAgent";
import useLocale from "../Hooks/useLocale";
import BooleanToIcon from "../UI/BooleanToIcon";
import SelectInput from "../UI/SelectInput";
import FormActions from "../Admin/UI/FormActions";
import Button from "../UI/Button";
import useNotification from "../Hooks/useNotification";
import Act from "../UI/Act";
import useProgress from "../Hooks/useProgress";
import { IUser, MongoDoc } from "../Hooks/useUser";
import { Population } from "../Admin/Clinic/AdminManageClinicsPage";
import PopupCard from "../UI/PopupCard";
import usePopup from "../Hooks/usePopup";

export const paymentMethods = ["Manual"] as const;

export type PaymentMethod = (typeof paymentMethods)[number];

export type InvoiceCheckoutPopulation = Population<{
  Invoice: InvoicePopulation;
}>;

export interface IInvoiceCheckout<
  T extends InvoiceCheckoutPopulation = InvoiceCheckoutPopulation
> extends MongoDoc {
  invoice: T["Invoice"] extends InvoicePopulation
    ? IInvoice<T["Invoice"]>
    : string;
  paidAt: Date;
  paymentMethod: PaymentMethod;
}

export type InvoicePopulation = Population<{
  User: boolean;
  Session: DoctorSessionPopulation;
  Checkout: InvoiceCheckoutPopulation;
}>;

export interface IInvoice<T extends InvoicePopulation = InvoicePopulation>
  extends MongoDoc {
  submittedAt: Date;
  total: number;
  user: T["User"] extends true ? IUser : string;
  session?: T["Session"] extends DoctorSessionPopulation
    ? IDoctorSession<T["Session"]>
    : string;
  sessionKind?: DoctorSessionType;
  checkout?: T["Checkout"] extends InvoiceCheckoutPopulation
    ? IInvoiceCheckout<T["Checkout"]> | null
    : never;
  payable: boolean;
}

const SelectSessionToReservePopup = ({
  stamp,
  doctor,
}: {
  stamp: string;
  doctor: IDoctorProfile;
}) => {
  const { data, error } = useSWR<IDoctorSession[]>(
    `${API}/public/doctor/${doctor._id}/day/${stamp}`,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );

  const [selected, setSelected] = useState<IDoctorSession | null>(null);

  const [selectedKind, setSelectedKind] = useState<DoctorSessionType | null>(
    null
  );

  const [isLoading, setIsLoading] = useState<Record<string, unknown> | null>(
    null
  );

  const { closePopup } = usePopup();

  const getContent = useLocale();

  const pushNotification = useNotification();

  useEffect(() => {
    setSelectedKind(null);
  }, [selected]);

  const onSubmit = () => {
    if (!!isLoading) return;
    if (!selected)
      return pushNotification(getContent("missingSessionChoiceErrorMessage"));
    if (!selectedKind)
      return pushNotification(getContent("missingSessionKindErrorMessage"));
    setIsLoading({ session: selected._id, kind: selectedKind });
  };

  const push = useProgress();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <PopupCard>
          {data.length ? (
            <div className={classes.main}>
              <div className={classes.choices}>
                {data
                  .sort((a, b) => a.start - b.start)
                  .map((el) => (
                    <Button
                      type="button"
                      variant={
                        selected?._id === el._id ? "Primary" : "PrimaryStroke"
                      }
                      className={`${classes.choice}`}
                      key={el._id}
                      onClick={() => {
                        if (!!isLoading) return;
                        setSelected(el);
                      }}
                    >
                      <div className={classes.choiceTime}>{`${numberToTime(
                        el.start
                      )} - ${numberToTime(el.end)}`}</div>
                      <div className={classes.choiceOptions}>
                        {doctorSessionTypes.map((kind) => (
                          <span key={kind} className={classes.kind}>
                            <span>{getContent(kind)}</span>
                            <BooleanToIcon value={!!el[kind]} />
                          </span>
                        ))}
                      </div>
                    </Button>
                  ))}
              </div>
              {!!selected && (
                <div className={classes.kindSelector}>
                  <SelectInput
                    readOnly={!!isLoading}
                    onChange={(e) =>
                      setSelectedKind(
                        doctorSessionTypes.find(
                          (el) => el === e.target.value
                        ) || null
                      )
                    }
                    options={doctorSessionTypes
                      .filter((kind) => !!selected[kind])
                      .reduce(
                        (acc, el) => ({ ...acc, [el]: getContent(el) }),
                        {}
                      )}
                    title={getContent("selectKind")}
                  />
                </div>
              )}
              <FormActions>
                <Button isLoading={!!isLoading} onClick={onSubmit}>
                  {getContent("submit")}
                </Button>
              </FormActions>
            </div>
          ) : (
            <p>{getContent("noSessionAvailableForSelectedPeriodMessage")}</p>
          )}
        </PopupCard>
      )}
      <Act<{ data: IInvoice }>
        path={isLoading ? `${API}/booking/book` : null}
        method="POST"
        payload={isLoading || undefined}
        onDone={(status, result) => {
          setIsLoading(null);
          if (!status) return;
          push(`/dashboard/invoice/${result?.data._id || ""}`);
          closePopup();
        }}
      />
    </HandleLoading>
  );
};

export default SelectSessionToReservePopup;
