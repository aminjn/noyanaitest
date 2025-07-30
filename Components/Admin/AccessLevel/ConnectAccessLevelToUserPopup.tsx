import { IUser } from "@/Components/Hooks/useUser";
import { IAccessLevel } from "./AdminManageAccessLevelsPage";
import classes from "./ConnectAccessLevelToUserPopup.module.css";
import CreateForm from "../UI/CreateForm";
import { IUserAccessLevel } from "./AccessLevelAdminsTab";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import { getAccessLevelLabel, getUserLabel } from "../Lib/LabelGetters";
import Box from "../UI/Box";

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
    <Box>
      <CreateForm<IUserAccessLevel>
        renderer={{
          ...(user
            ? {}
            : {
                user: {
                  type: "nodes",
                  title: "یوزر",
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
                  title: "سطح دسترسی",
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
            if (!user && !inp.user) return "لطفا کاربر را انتخاب فرمایید";
            if (!accessLevel && !inp.accessLevel)
              return "لطفا سطح دسترسی را انتخاب فرمایید";
          },
        }}
        onCancel={() => closePopup()}
      />
    </Box>
  );
};

export default ConnectAccessLevelToUserPopup;
