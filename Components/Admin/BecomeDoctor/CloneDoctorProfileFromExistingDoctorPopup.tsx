import PopupCard from "@/Components/UI/PopupCard";
import { IUser } from "@/Components/Hooks/useUser";
import { IDoctor } from "../Doctor/AdminManageDoctorsPage";
import CreateForm from "../UI/CreateForm";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";
import { getDoctorLabel, getUserLabel } from "../Lib/LabelGetters";
import { fetcher } from "@/Components/helpers/fetcher";
import useSWR from "swr";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import useForm from "@/Components/Hooks/useForm";
import ToggleInput from "@/Components/UI/ToggleInput";
import { useState } from "react";
import useProgress from "@/Components/Hooks/useProgress";
import { adminPath } from "@/Components/helpers/adminPath";
import { ta } from "@/Components/Admin/i18n/adminText";

const CloneDoctorProfileFromExistingDoctorPopup = ({
  mutate,
  user,
  doctor,
}: {
  mutate: () => unknown;
} & (
  | { user: IUser; doctor?: never }
  | {
      doctor: IDoctor<{ SpecialityPopulated: Record<never, never> }>;
      user?: never;
    }
)) => {
  const { data } = useSWR<
    IDoctor<{ SpecialityPopulated: Record<never, never> }>[]
  >(`${API}/auto/doctor`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const [proceed, setProceed] = useState<boolean>(false);

  const push = useProgress();

  const form = useForm<
    IDoctorProfile & { doctor: string },
    { data: { data: IDoctorProfile } }
  >({
    path: `${API}/auto/doctorprofile`,
    method: "POST",
    successCb: (result) => {
      mutate();
      if (proceed) {
        push(adminPath(`/doctorprofile/${result.data.data._id}`));
      }
      closePopup();
    },
    mutator: (inp) => {
      const doc = doctor || data?.find((d) => d._id === inp.doctor);
      if (!doc) return {};
      const { name, summary: introduction, site: website, landLine, lat, lng } = doc;
      // "دکتر رضا احمدی" -> first "دکتر رضا", last "احمدی"
      const parts = (name || "").trim().split(/\s+/);
      const lastName = parts.length > 1 ? parts.pop() : "";
      const idOf = (el: unknown) => String((el as { _id?: unknown })?._id ?? el);
      const specialities = [doc.speciality, ...(doc.specialities || [])]
        .filter(Boolean)
        .map(idOf)
        .filter((el, i, arr) => arr.indexOf(el) === i);
      const latNum = Number(lat);
      const lngNum = Number(lng);
      return {
        user: inp.user || user?._id,
        firstName: parts.join(" "),
        lastName,
        introduction,
        website,
        landLine,
        // the profile's main speciality field is mainSpeciality (a
        // "speciality" field doesn't exist, so the main one was lost); the
        // legacy province/city are slugs, not Geo ids, so they're left for
        // the admin to pick; lat/lng become the map point
        mainSpeciality: specialities[0],
        // compound fields are JSON-parsed by the endpoint (editBodyMutator)
        specialities: JSON.stringify(specialities),
        ...(Number.isFinite(latNum) && Number.isFinite(lngNum) && lat && lng
          ? { location: JSON.stringify({ type: "Point", coordinates: [lngNum, latNum] }) }
          : {}),
      };
    },
  });

  const { closePopup } = usePopup();

  return (
    <PopupCard title={ta("ساخت پروفایل از پزشک موجود")}>
      <ToggleInput
        title={ta("رفتن به پروفایل ساخته شده بعد از اتمام عملیات")}
        value={proceed}
        onChange={() => setProceed((prev) => !prev)}
      />
      <CreateForm
        onCancel={() => closePopup()}
        hookProvided={form}
        renderer={{
          ...(user
            ? {}
            : {
                user: {
                  type: "nodes",
                  path: `${API}/auto/user`,
                  title: ta("کاربر"),
                  getOptionLabel: (node) => getUserLabel(node as IUser),
                  getOptionValue: (node) => (node as IUser)._id,
                },
              }),
          ...(doctor
            ? {}
            : {
                doctor: {
                  type: "nodes",
                  path: `${API}/auto/doctor`,
                  title: ta("پزشک"),
                  getOptionLabel: (doc) => getDoctorLabel(doc as IDoctor),
                  getOptionValue: (node) => (node as IDoctor)._id,
                },
              }),
        }}
      />
    </PopupCard>
  );
};

export default CloneDoctorProfileFromExistingDoctorPopup;
