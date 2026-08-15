import { callTypeDict } from "@/Components/Dashboard/Call/DashboardManageCallsPage";
import CreateForm from "../UI/CreateForm";
import useUser, { IUser } from "@/Components/Hooks/useUser";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";

type CreateCallInput = {
  participantIds: string[];
  callType: string;
  joinMyself: boolean;
};

const CreateCallPopup = ({ mutate }: { mutate: () => unknown }) => {
  const { closePopup } = usePopup();
  const { user } = useUser();

  return (
    <PopupCard>
      <CreateForm<CreateCallInput>
        style={{ width: "min(90dvw , 40rem)" }}
        renderer={{
          participantIds: {
            type: "nodes",
            title: "شرکت کنندگان",
            getOptionLabel: (node) =>
              (node as IUser).phone || (node as IUser)._id,
            getOptionValue: (node) => (node as IUser)._id,
            path: `${API}/auto/user`,
            multi: true,
          },
          callType: {
            type: "select",
            title: "نوع تماس",
            options: callTypeDict,
          },
          joinMyself: {
            type: "bool",
            title: "خودم هم عضو تماس شوم",
          },
        }}
        hookProps={{
          path: `${API}/admin/call/create`,
          method: "POST",
          hasProblem: (inp) => {
            const count =
              (inp.participantIds?.length || 0) + (inp.joinMyself ? 1 : 0);
            if (count < 2) return "حداقل باید دو شرکت کننده انتخاب شود";
          },
          mutator: (inp) => ({
            participantIds:
              inp.joinMyself && user
                ? [...(inp.participantIds || []), user._id]
                : inp.participantIds || [],
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
