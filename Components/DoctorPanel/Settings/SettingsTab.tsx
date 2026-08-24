import CreateForm, { FormRenderer } from "@/Components/Admin/UI/CreateForm";
import { DoctorSessionType } from "../Calendar/DoctorCalendarDay";
import classes from "./SettingsTab.module.css";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { IDoctorProfile } from "../DoctorPanelPage";
import { useMemo } from "react";
import useLocale from "@/Components/Hooks/useLocale";
import useSWR, { mutate } from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";

//TODO: you might need to map this
//TODO: maybe add generic population controller
export interface ISessionSettings extends MongoDoc {
  doctor: IDoctorProfile;
  receiver?: string;
  price?: number;
  active: boolean;
  hidePrice?: boolean;
}

const SettingsTab = ({ kind }: { kind: DoctorSessionType }) => {
  const { data, error, mutate } = useSWR<ISessionSettings>(
    `${API}/doctor/settings/${kind}`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const getContent = useLocale();

  const commons = useMemo<FormRenderer<ISessionSettings>>(
    () => ({
      price: { type: "number", title: getContent("price"), price: true },
      active: { type: "bool", title: getContent("active") },
    }),
    [getContent],
  );

  const sessionTypeToFormRenderer = useMemo<
    Record<DoctorSessionType, FormRenderer<ISessionSettings>>
  >(
    () => ({
      inPerson: {
        ...commons,
        hidePrice: { title: getContent("hidePrice"), type: "bool" },
      },
      sipCall: {
        ...commons,
        receiver: { type: "text", title: getContent("callReceiver") },
      },
      textChat: { ...commons },
      videoCall: { ...commons },
      voiceCall: { ...commons },
    }),
    [commons, getContent],
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <CreateForm
          className={classes.main}
          renderer={sessionTypeToFormRenderer[kind]}
          defaultValue={data}
          hookProps={{
            path: `${API}/doctor/settings/${kind}`,
            method: "POST",
            successCb: () => {
              mutate();
            },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default SettingsTab;
