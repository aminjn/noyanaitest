import PopupCard from "@/Components/UI/PopupCard";
import { IBecomeDoctorRequest, IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import CreateForm from "../UI/CreateForm";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";
import { getDoctorProfileLabel } from "../Lib/LabelGetters";
import { ta } from "@/Components/Admin/i18n/adminText";

// Approving a become-doctor request by linking a profile that already
// exists (an imported directory profile, or one made earlier) instead of
// building a new one. Goes through the approval itself, so the request is
// approved, the profile is claimed, the account can own only one profile and
// the doctor is told - the same checks as the «مالک پنل» tab.
const AssignDoctorProfileToUserPopup = ({
  mutate,
  req,
  councilChecked,
}: {
  mutate: () => unknown;
  req: Pick<IBecomeDoctorRequest, "_id">;
  // a request without the council inquiry: its checklist was completed
  councilChecked?: boolean;
}) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard title={ta("اتصال پروفایل به کاربر")}>
      <CreateForm<{ profile: string }>
        onCancel={() => closePopup()}
        renderer={{
          profile: {
            type: "nodes",
            // only profiles nobody owns yet
            path: `${API}/auto/doctorprofile?claimed=false`,
            getOptionLabel: (node) => getDoctorProfileLabel(node as IDoctorProfile),
            getOptionValue: (node) => (node as IDoctorProfile)._id,
            title: ta("پروفایل"),
            multi: false,
          },
        }}
        styleManaged
        hookProps={{
          path: `${API}/admin/becomedoctor/${req._id}/approve`,
          method: "POST",
          hasProblem: (inp) => (!inp.profile ? ta("لطفا پروفایل را انتخاب کنید") : false),
          mutator: (inp) => ({
            profile: Array.isArray(inp.profile) ? inp.profile[0] : inp.profile,
            ...(councilChecked ? { councilChecked: true } : {}),
          }),
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
