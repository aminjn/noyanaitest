import useSWR from "swr";
import { IUserIdentity } from "../Dashboard/DashboardPage";
import { IDoctorSession } from "../DoctorPanel/Calendar/DoctorCalendarDay";
import useLocale from "../Hooks/useLocale";
import PopupCard from "../UI/PopupCard";
import classes from "./CheckoutPopup.module.css";
import DoctorBookingCard from "./DoctorBookingCard";
import { BookingContext, PopulatedBookingContext } from "./SubmitBookingPage";
import { DoctorConfig } from "./PublicDrSessions";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import Loading from "../Admin/UI/Loading";
import HandleLoading from "../Admin/UI/HandleLoading";
import { Fragment, useState } from "react";
import ErrorMessage from "../Admin/UI/ErrorMessage";
import Button from "../UI/Button";
import Ixon from "../UI/Ixon";
import InfoIcon from "../Icons/InfoIcon";
import InfoCircleIcon from "../Icons/InfoiCircleIcon";
import Act from "../UI/Act";
import { IInvoice } from "../Booking/SelectSessionToReservePopup";
import usePopup from "../Hooks/usePopup";
import CheckoutPalPopup from "../Dashboard/Invoice/CheckoutPopup";

const CheckoutPopup = ({
  context,
  session,
  patient,
}: {
  patient?: IUserIdentity;
  context: PopulatedBookingContext;
  session: IDoctorSession<{
    Booking: Record<never, never>;
    Doctor: { MainSpecialityPopulated: Record<never, never> };
  }>;
}) => {
  const { data: config, error: configsError } = useSWR<DoctorConfig>(
    `${API}/public/doctor/${session.doctor._id}/config`,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );

  const [invoice, setInvoice] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getContent = useLocale();

  const { setPopup } = usePopup();

  const { closePopup } = usePopup();

  return (
    <HandleLoading data={!!config} error={configsError}>
      {!!config && (
        <Fragment>
          {!!config[context.sessionType]?.price ? (
            <PopupCard>
              <div className={classes.main}>
                <legend className={classes.title}>
                  {getContent("bookingCheckoutTitle")}
                </legend>
                <DoctorBookingCard node={session.doctor} />
                <div className={classes.cta}>
                  <div className={classes.priceBox}>
                    <span>{getContent("payablePrice")}</span>
                    <div className={classes.price}>
                      <span>{config[context.sessionType]?.price}</span>
                      <span className={classes.unit}>
                        {getContent("toman")}
                      </span>
                    </div>
                  </div>
                  <Button
                    className={classes.action}
                    onClick={() => setIsLoading(true)}
                  >
                    {getContent("pay")}
                  </Button>
                </div>
                <div className={classes.tips}>
                  <legend className={classes.tipsTitle}>
                    <Ixon width="1rem">
                      <InfoCircleIcon />
                    </Ixon>
                    <span>{getContent("bookingTipsTitle")}</span>
                  </legend>
                  <p className={classes.tipsValue}>
                    {getContent("bookingTips")}
                  </p>
                </div>
              </div>
            </PopupCard>
          ) : (
            <ErrorMessage
              message={getContent("thisDoctorDosentSupportThisSessionType")}
            />
          )}
        </Fragment>
      )}
      <Act<{ data: IInvoice }>
        path={isLoading ? `${API}/booking/book` : null}
        method="POST"
        payload={{
          session: session._id,
          kind: context.sessionType,
          patient: patient?._id,
        }}
        onDone={(status, result) => {
          setIsLoading(false);
          if (!status || !result) return;
          //   push(`/dashboard/invoice/${result?.data._id || ""}`);
          setPopup(
            "CheckoutPal",
            <CheckoutPalPopup
              invoice={result.data}
              mutate={() => closePopup()}
            />
          );
          //   closePopup();
        }}
      />
    </HandleLoading>
  );
};

export default CheckoutPopup;
