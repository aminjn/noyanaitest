import PopupCard from "@/Components/UI/PopupCard";
import { IUser } from "@/Components/Hooks/useUser";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import CreateForm from "../UI/CreateForm";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";
import { getDoctorProfileLabel, getUserLabel } from "../Lib/LabelGetters";
import { ta } from "@/Components/Admin/i18n/adminText";

const AssignDoctorProfileToUserPopup = ({
  mutate,
  profile,
  user,
}: {
  mutate: () => unknown;
  user?: IUser;
  profile?: IDoctorProfile;
}) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard title={ta("اتصال پروفایل به کاربر")}>
      <CreateForm<{ user: string; profile: string }>
        onCancel={() => closePopup()}
        renderer={{
          ...(user
            ? {}
            : {
                user: {
                  type: "nodes",
                  path: `${API}/auto/user`,
                  getOptionLabel: (node) => getUserLabel(node as IUser),
                  getOptionValue: (node) => (node as IUser)._id,
                  title: ta("کاربر"),
                },
              }),
          ...(profile
            ? {}
            : {
                profile: {
                  type: "nodes",
                  path: `${API}/auto/doctorprofile`,
                  getOptionLabel: (node) =>
                    getDoctorProfileLabel(node as IDoctorProfile),
                  getOptionValue: (node) => (node as IDoctorProfile)._id,
                  title: ta("پروفایل"),
                },
              }),
        }}
        styleManaged
        hookProps={{
          path: profile
            ? `${API}/auto/doctorprofile/${profile._id}`
            : (inp) => `${API}/auto/doctorprofile/${inp.profile}`,
          method: "POST",
          hasProblem: (inp) => {
            if (!profile && !inp.profile) return ta("لطفا پروفایل را انتخاب کنید");
            if (!user && !inp.user) return ta("لطفا یوزر را انتخاب کنید");
          },
          mutator: (inp) => ({ user: user ? user._id : inp.user }),
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
      />
    </PopupCard>
  );
};

export default AssignDoctorProfileToUserPopup;
