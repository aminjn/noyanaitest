import classes from "./PreviewSecretaryAccessLevelPopup.module.css";
import TableBox from "@/Components/UI/TableBox";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import BooleanToIcon from "@/Components/UI/BooleanToIcon";
import FormActions from "@/Components/Admin/UI/FormActions";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import List from "@/Components/Admin/UI/List";
import { Acl, NodeWithAcl } from "../Request/CreateSecretaryRequestPopup";
import {
  categoriesAclMap,
  categorizedAclMap,
} from "./MutateSecretaryAccessLevelPopup";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "secretaryManager"];

const PreviewSecretaryAccessLevelPopup = ({
  node,
  name,
}: {
  node: Acl<string[], unknown>;
  name: NodeWithAcl;
}) => {
  const getContent = useScopedLocale(LOCALE_NS);

  const { closePopup } = usePopup();

  return (
    <PopupCard>
      <TableBox
        className={classes.main}
        title={node.name || getContent("accessLevel")}
      >
        <ClientTabSystem
          items={categoriesAclMap[name].map((category) => ({
            id: category,
            title: getContent(category),
            content: (
              <List>
                {categorizedAclMap[name][category].map((action) => (
                  <div key={action} className={classes.item}>
                    <BooleanToIcon value={!!node[action]} />
                    <legend>{getContent(action)}</legend>
                  </div>
                ))}
              </List>
            ),
          }))}
        />
        <FormActions className={classes.actions}>
          <Button onClick={() => closePopup()}>{getContent("close")}</Button>
        </FormActions>
      </TableBox>
    </PopupCard>
  );
};

export default PreviewSecretaryAccessLevelPopup;
