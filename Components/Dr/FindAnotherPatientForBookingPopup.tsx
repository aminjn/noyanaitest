import CreateForm from "../Admin/UI/CreateForm";
import { API } from "../config";
import { IUserIdentity } from "../Dashboard/DashboardPage";
import useLocale from "../Hooks/useLocale";
import useNotification from "../Hooks/useNotification";
import usePopup from "../Hooks/usePopup";
import PopupCard from "../UI/PopupCard";
import classes from "./FindAnotherPatientForBooking.module.css";

const FindAnotherPatientForBookingPopup = ({
  onDone,
}: {
  onDone: (identity: IUserIdentity) => unknown;
}) => {
  const getContent = useLocale();

  const { closePopup } = usePopup();

  const pushNotification = useNotification();

  return (
    <PopupCard>
      <div className={classes.main}>
        <legend className={classes.legend}>
          {getContent("otherPatientDetails")}
        </legend>
        <CreateForm<{
          birthDate: Date;
          nationalId: string;
          mobileNumber: string;
        }>
          renderer={{
            birthDate: {
              title: getContent("anotherPatientBirthDate"),
              type: "date",
            },
            nationalId: {
              type: "text",
              title: getContent("anotherPatientNationalId"),
            },
            mobileNumber: {
              type: "text",
              title: getContent("anotherPatientMobileNumber"),
            },
          }}
          onCancel={() => closePopup()}
          hookProps={{
            path: `${API}/user/identity`,
            method: "POST",
            successCb: (result) => {
              const identity = (result as { data: IUserIdentity })?.data;
              if (!identity) return pushNotification("unexpectedErrorOccured");
              onDone(identity);
              closePopup();
            },
          }}
        />
      </div>
    </PopupCard>
  );
};

export default FindAnotherPatientForBookingPopup;
