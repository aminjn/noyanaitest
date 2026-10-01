import { Fragment, useState } from "react";
import { IArticle, OrgArticleKind, orgArticleConfig } from "./orgArticle";
import usePopup from "@/Components/Hooks/usePopup";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";

const OrgDeleteArticlePopup = ({
  kind,
  mutate,
  node,
}: {
  kind: OrgArticleKind;
  node: IArticle;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();

  const getContent = useScopedLocale(orgArticleConfig[kind].ns);

  return (
    <Fragment>
      <ConfirmationPopup
        message={getContent("sureDeleteArticle")}
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/blog/${kind}/${node._id}` : null}
        method="PUT"
        onDone={(status) => {
          setIsLoading(false);
          if (!status) return;
          mutate();
          closePopup();
        }}
      />
    </Fragment>
  );
};

export default OrgDeleteArticlePopup;
