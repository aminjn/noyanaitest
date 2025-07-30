import { IUser } from "@/Components/Hooks/useUser";
import classes from "./AssignProfileToUserPopup.module.css";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import Box from "../UI/Box";
import CreateForm from "../UI/CreateForm";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";
import { getDoctorProfileLabel, getUserLabel } from "../Lib/LabelGetters";

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
    <Box>
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
                  title: "یوزر",
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
                  title: "پروفایل",
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
            if (!profile && !inp.profile) return "لطفا پروفایل را انتخاب کنید";
            if (!user && !inp.user) return "لطفا یوزر را انتخاب کنید";
          },
          mutator: (inp) => ({ user: user ? user._id : inp.user }),
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
      />
    </Box>
  );
};

export default AssignDoctorProfileToUserPopup;
