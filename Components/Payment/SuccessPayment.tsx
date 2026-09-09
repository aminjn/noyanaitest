import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { useParams } from "next/navigation";
import HandleLoading from "../Admin/UI/HandleLoading";
import { IInvoice } from "../Booking/SelectSessionToReservePopup";

import classes from "./SuccessPayment.module.css";
import useLocale from "../Hooks/useLocale";
import { getDoctorProfileLabel } from "../Admin/Lib/LabelGetters";
import FormatDate from "../UI/FormatDate";
import { Fragment } from "react";
import { numberToTime } from "../DoctorPanel/Calendar/AddSessionsAgent";
import Button from "../UI/Button";
import useProgress from "../Hooks/useProgress";
import Ixon from "../UI/Ixon";
import CheckIcon from "../Icons/CheckIcon";
import CheckCircleIcon from "../Icons/CheckCircleIcon";
import DownloadIcon from "../Icons/DownloadIcon";
import useUser from "../Hooks/useUser";
import LoginRequired from "../UI/LoginRequired";

const SuccessPayment = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { user, isUserLoading } = useUser();

  const { data, error } = useSWR<
    IInvoice<{
      Checkout: Record<never, never>;
      Session: {
        Doctor: Record<never, never>;
        Booking: { Patient: Record<never, never> };
      };
    }>
  >(`${API}/user/invoice/${nodeId}`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  console.log(data);

  const getContent = useLocale();

  const push = useProgress();

  if (!isUserLoading && !user) return <LoginRequired />;

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <Ixon width="3.875rem" className={classes.icon}>
            <CheckCircleIcon />
          </Ixon>
          <legend className={classes.legend}>
            {getContent("paymentSucceededMessage")}
          </legend>
          {!!data.session && (
            <div className={classes.details}>
              <div className={classes.pair}>
                <span className={classes.title}>{getContent("doctor")}</span>
                <span className={classes.divider} />
                <span>{getDoctorProfileLabel(data.session.doctor)}</span>
              </div>
              <div className={classes.pair}>
                <span className={classes.title}>
                  {getContent("sessionTime")}
                </span>
                <span className={classes.divider} />
                <span>
                  <FormatDate
                    time={false}
                    value={new Date(data.session.date)}
                  />
                  <span>-</span>
                  <span>{numberToTime(data.session.start)}</span>
                </span>
              </div>
              <div className={classes.pair}>
                <span className={classes.title}>
                  {getContent("patientName")}
                </span>
                <span className={classes.divider} />
                <span>{`${data.session.booking?.patient.givenName} ${data.session.booking?.patient.lastName}`}</span>
              </div>
            </div>
          )}
          <div className={classes.actions}>
            <Button leadIcon={<DownloadIcon />}>
              {getContent("getSessionReciept")}
            </Button>
            <Button
              onClick={() => push("/dashboard")}
              className={classes.dashboard}
            >
              {getContent("dashboard")}
            </Button>
          </div>
        </div>
      )}
    </HandleLoading>
  );
};

export default SuccessPayment;
