import { callTypeDict } from "@/Components/Dashboard/Call/DashboardManageCallsPage";
import { useState } from "react";
import CreateForm from "../UI/CreateForm";
import useUser from "@/Components/Hooks/useUser";
import UserSearchSelect, { UserOption } from "../UI/UserSearchSelect";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import { ta } from "@/Components/Admin/i18n/adminText";

type CreateCallInput = {
  callType: string;
  joinMyself: boolean;
};

const CreateCallPopup = ({ mutate }: { mutate: () => unknown }) => {
  const { closePopup } = usePopup();
  const { user } = useUser();
  // participants are found by server search (GET /admin/users?q=), not by
  // loading every account
  const [participants, setParticipants] = useState<UserOption[]>([]);
  const participantIds = participants.map((p) => p._id);

  return (
    <PopupCard title={ta("تماس جدید")}>
      <UserSearchSelect
        multi
        title={ta("شرکت کنندگان")}
        value={participants}
        onChange={setParticipants}
      />
      <CreateForm<CreateCallInput>
        style={{ width: "min(90dvw , 40rem)" }}
        renderer={{
          callType: {
            type: "select",
            title: ta("نوع تماس"),
            options: callTypeDict,
          },
          joinMyself: {
            type: "bool",
            title: ta("خودم هم عضو تماس شوم"),
          },
        }}
        hookProps={{
          path: `${API}/admin/call/create`,
          method: "POST",
          hasProblem: (inp) => {
            const count =
              participantIds.length + (inp.joinMyself ? 1 : 0);
            if (count < 2) return ta("حداقل باید دو شرکت کننده انتخاب شود");
          },
          mutator: (inp) => ({
            participantIds:
              inp.joinMyself && user
                ? [...participantIds.filter((id) => id !== user._id), user._id]
                : participantIds,
            callType: inp.callType,
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

export default CreateCallPopup;
