import PopupCard from "@/Components/UI/PopupCard";
import { IUser } from "@/Components/Hooks/useUser";
import { IAccessLevel } from "./AdminManageAccessLevelsPage";
import CreateForm from "../UI/CreateForm";
import { IUserAccessLevel } from "./AccessLevelAdminsTab";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import { getAccessLevelLabel, getUserLabel } from "../Lib/LabelGetters";
import { ta } from "@/Components/Admin/i18n/adminText";

const ConnectAccessLevelToUserPopup = ({
  accessLevel,
  mutate,
  user,
}: {
  mutate: () => unknown;
  accessLevel?: IAccessLevel;
  user?: IUser;
}) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard title={ta("اتصال سطح دسترسی به کاربر")}>
      <CreateForm<IUserAccessLevel>
        renderer={{
          ...(user
            ? {}
            : {
                user: {
                  type: "nodes",
                  title: ta("یوزر"),
                  path: `${API}/auto/user`,
                  getOptionLabel: (node) => getUserLabel(node as IUser),
                  getOptionValue: (node) => (node as IUser)._id,
                },
              }),
          ...(accessLevel
            ? {}
            : {
                  accessLevel: {
                    type: "nodes",
                    title: ta("سطح دسترسی"),
                    path: `${API}/auto/accesslevel`,
                    getOptionLabel: (node) =>
                      getAccessLevelLabel(node as IAccessLevel),
                    getOptionValue: (node) => (node as IAccessLevel)._id,
                  },
              }),
        }}
        hookProps={{
          path: `${API}/auto/useraccesslevel`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
          mutator: (inp) => ({
            accessLevel: inp.accessLevel || accessLevel?._id,
            user: inp.user || user?._id,
          }),
          hasProblem: (inp) => {
            if (!user && !inp.user) return ta("لطفا کاربر را انتخاب فرمایید");
            if (!accessLevel && !inp.accessLevel)
              return ta("لطفا سطح دسترسی را انتخاب فرمایید");
          },
        }}
        onCancel={() => closePopup()}
      />
    </PopupCard>
  );
};

export default ConnectAccessLevelToUserPopup;
