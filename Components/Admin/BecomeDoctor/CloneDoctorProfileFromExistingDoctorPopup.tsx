import { IUser } from "@/Components/Hooks/useUser";
import classes from "./CloneDoctorProfileFromExistingDoctorPopup.module.css";
import { IDoctor } from "../Doctor/AdminManageDoctorsPage";
import CreateForm from "../UI/CreateForm";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";
import { getDoctorLabel, getUserLabel } from "../Lib/LabelGetters";
import { fetcher } from "@/Components/helpers/fetcher";
import useSWR from "swr";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import useForm from "@/Components/Hooks/useForm";
import Box from "../UI/Box";
import ToggleInput from "@/Components/UI/ToggleInput";
import { useState } from "react";
import useProgress from "@/Components/Hooks/useProgress";
import { adminPath } from "@/Components/helpers/adminPath";

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
      const {
        name: firstName,
        summary: introduction,
        site: website,
        landLine,
        province,
        city,
        lat,
        lng,
      } = doc;
      return {
        user: inp.user || user?._id,
        firstName,
        introduction,
        website,
        landLine,
        province,
        city,
        lat,
        lng,
        specialities: doc.specialities,
        speciality: doc.speciality?._id,
      };
    },
  });

  const { closePopup } = usePopup();

  return (
    <Box>
      <ToggleInput
        title="رفتن به پروفایل ساخته شده بعد از اتمام عملیات"
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
                  title: "کاربر",
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
                  title: "پزشک",
                  getOptionLabel: (doc) => getDoctorLabel(doc as IDoctor),
                  getOptionValue: (node) => (node as IDoctor)._id,
                },
              }),
        }}
      />
    </Box>
  );
};

export default CloneDoctorProfileFromExistingDoctorPopup;
