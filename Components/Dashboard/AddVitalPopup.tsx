import classes from "./AddVitalPoppup.module.css";
import CreateForm from "../Admin/UI/CreateForm";
import { API } from "../config";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import usePopup from "../Hooks/usePopup";
import { IUserVital } from "../Hooks/useUser";
import PopupCard from "../UI/PopupCard";

const NS: ContentNamespace[] = ["common", "dashboardAddVitalPopup"];

const AddVitalPopup = ({
  patient,
  mutate,
}: {
  patient: string;
  mutate?: () => unknown;
}) => {
  const { closePopup } = usePopup();

  const getContent = useScopedLocale(NS);

  return (
    <PopupCard>
      <legend className={classes.title}>{getContent("addVitalTitle")}</legend>
      <CreateForm<IUserVital>
        renderer={{
          bloodOxygen: {
            title: getContent("bloodOxygen"),
            type: "range",
            min: 60,
            max: 100,
            step: 1,
            markCount: 5,
          },
          bloodPressure: {
            title: getContent("bloodPressure"),
            type: "range",
            min: 30,
            max: 300,
            step: 5,
            markCount: 5,
          },
          bodyTemp: {
            title: getContent("bodyTemperature"),
            type: "range",
            markCount: 5,
            min: 20,
            max: 50,
            step: 1,
          },
          heartRate: {
            title: getContent("heartRate"),
            type: "range",
            markCount: 5,
            min: 40,
            max: 200,
            step: 5,
          },
        }}
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/doctor/patient/vital/${patient}`,
          method: "POST",
          successCb: () => {
            mutate?.();
            closePopup();
          },
          hasProblem: (inp) => {
            if (
              !inp.bloodOxygen ||
              !inp.bloodPressure ||
              !inp.bodyTemp ||
              !inp.heartRate
            )
              return getContent("checkInput");
          },
        }}
        className={classes.main}
      />
    </PopupCard>
  );
};

export default AddVitalPopup;
