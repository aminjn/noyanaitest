import { IDoctorSecretary } from "@/Components/DoctorPanel/Secretary/Request/CreateDoctorSecretaryRequestPopup";
import classes from "./MountDoctorPopup.module.css";
import Loading from "@/Components/Admin/UI/Loading";
import useSWR from "swr";
import ErrorMessage from "@/Components/Admin/UI/ErrorMessage";
import { API } from "@/Components/config";
import { fetcher, FethcerArgs } from "@/Components/helpers/fetcher";
import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";

const MountDoctorPopup = ({ node }: { node: IDoctorSecretary }) => {
  const { closePopup } = usePopup();
  const push = useProgress();
  const { error } = useSWR(
    {
      url: `${API}/secretary/doctor/${node._id}`,
      method: "POST",
    },
    (args: FethcerArgs) => fetcher(args),
    {
      onSuccess: () => {
        push("/doctorpanel");
        closePopup();
      },
    }
  );

  if (error) return <ErrorMessage message={error.message} />;
  return <Loading />;
};

export default MountDoctorPopup;
