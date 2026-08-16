import CreateForm from "@/Components/Admin/UI/CreateForm";
import classes from "./EditDoctorSecretaryRequestPopup.module.css";
import PopupCard from "@/Components/UI/PopupCard";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import useLocale from "@/Components/Hooks/useLocale";
import { ISecretaryRequest } from "./SecretaryRequestsTab";
import {
  Acl,
  NodeWithAcl,
  SecretaryNodePath,
} from "./CreateSecretaryRequestPopup";
import { getAccessLevelLabel } from "@/Components/Admin/Lib/LabelGetters";

const EditSecretaryRequestPopup = ({
  mutate,
  node,
  name,
}: {
  node: ISecretaryRequest<SecretaryNodePath, { Acl: true }>;
  mutate: () => unknown;
  name: NodeWithAcl;
}) => {
  const { closePopup } = usePopup();

  const getContent = useLocale();

  return (
    <PopupCard>
      <CreateForm
        className={classes.main}
        defaultValue={node}
        hookProps={{
          path: `${API}/acl/${name}/secretaryrequest/${node._id}`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        onCancel={() => closePopup()}
        renderer={{
          displayName: { type: "text", title: getContent("phone") },
          acl: {
            type: "nodes",
            path: `${API}/acl/${name}/acl`,
            title: getContent("accessLevel"),
            getOptionLabel: (node) =>
              getAccessLevelLabel(node as Acl<[], unknown>),
            getOptionValue: (node) => (node as Acl<[], unknown>)._id,
            getDefaultValue: (node) => node.acl?._id,
            dataParser: (res) =>
              (res as Record<"data", Acl<[], unknown>[]>).data,
            clearable: true,
          },
          message: { type: "area", title: getContent("message") },
        }}
      />
    </PopupCard>
  );
};

export default EditSecretaryRequestPopup;
