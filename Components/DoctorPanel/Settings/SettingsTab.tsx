import CreateForm, { FormRenderer } from "@/Components/Admin/UI/CreateForm";
import { DoctorSessionType } from "../Calendar/DoctorCalendarDay";
import classes from "./SettingsTab.module.css";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { IDoctorProfile } from "../DoctorPanelPage";
import { useMemo } from "react";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useSWR, { mutate } from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelSettings"];

//TODO: you might need to map this
//TODO: maybe add generic population controller
export interface ISessionSettings extends MongoDoc {
  doctor: IDoctorProfile;
  receiver?: string;
  price?: number;
  active: boolean;
  hidePrice?: boolean;
  // in person (2026-10): pay at the desk on/off, and the offices it is on at
  payAtDesk?: boolean;
  payAtDeskOffices?: string[];
  offices?: { _id: string; name?: string; active?: boolean }[];
}

const SettingsTab = ({ kind }: { kind: DoctorSessionType }) => {
  const { data, error, mutate } = useSWR<ISessionSettings>(
    `${API}/doctor/settings/${kind}`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const getContent = useScopedLocale(NS);

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
        payAtDesk: { title: getContent("setPayAtDesk"), type: "bool", hint: getContent("setPayAtDeskHint") },
        // per office, when there is more than one
        ...((Array.isArray(data?.offices) ? data.offices : []).length > 1
          ? {
              payAtDeskOffices: {
                type: "multiselect" as const,
                title: getContent("setPayAtDeskOffices"),
                options: Object.fromEntries(
                  (data?.offices || []).filter((o) => !!o?._id).map((o) => [o._id, o.name || o._id]),
                ),
              },
            }
          : {}),
      },
      sipCall: {
        ...commons,
        receiver: { type: "text", title: getContent("callReceiver") },
      },
      textChat: { ...commons },
      videoCall: { ...commons },
      voiceCall: { ...commons },
    }),
    [commons, getContent, data?.offices],
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
