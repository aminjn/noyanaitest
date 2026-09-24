import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import { API } from "@/Components/config";
// import { getAclLabel } from "@/Components/Admin/Lib/LabelGetters";
import usePopup from "@/Components/Hooks/usePopup";
import {
  Acl,
  ISecretary,
  SecretaryNodePath,
} from "../Request/CreateSecretaryRequestPopup";
import { getAccessLevelLabel } from "@/Components/Admin/Lib/LabelGetters";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "secretaryManager"];

const MutateSecretaryPopup = ({
  mutate,
  node,
  name,
}: {
  name: string;
  mutate: () => unknown;
  node: ISecretary<SecretaryNodePath, { Acl: true; Secretary: true }>;
}) => {
  const getContent = useScopedLocale(LOCALE_NS);

  const { closePopup } = usePopup();

  return (
    <PopupCard>
      <CreateForm
        defaultValue={node}
        renderer={{
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
        }}
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/acl/${name}/secretary/${node._id}`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
      />
    </PopupCard>
  );
};

export default MutateSecretaryPopup;
