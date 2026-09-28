import Loading from "@/Components/Admin/UI/Loading";
import useSWR from "swr";
import ErrorMessage from "@/Components/Admin/UI/ErrorMessage";
import { API } from "@/Components/config";
import { fetcher, FethcerArgs } from "@/Components/helpers/fetcher";
import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";
import {
  ISecretary,
  NodeWithAcl,
  SecretaryNodePath,
} from "../_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";

export const nameToPanelPath: Record<NodeWithAcl, string> = {
  clinic: "clinicpanel",
  doctor: "doctorpanel",
  insurance: "insurancepanel",
  pharmacy: "pharmacypanel",
  paraClinic: "paraClinicPanel",
  hospital: "hospitalpanel",
};

const MountBossPopup = ({
  node,
  name,
}: {
  node: ISecretary<SecretaryNodePath>;
  name: NodeWithAcl;
}) => {
  const { closePopup } = usePopup();
  const push = useProgress();
  const { error } = useSWR(
    {
      url: `${API}/secretary/boss/${name}/${node._id}`,
      method: "POST",
    },
    (args: FethcerArgs) => fetcher(args),
    {
      onSuccess: () => {
        push(`/${nameToPanelPath[name]}`);
        closePopup();
      },
    }
  );

  if (error) return <ErrorMessage message={error.message} />;
  return <Loading />;
};

export default MountBossPopup;
