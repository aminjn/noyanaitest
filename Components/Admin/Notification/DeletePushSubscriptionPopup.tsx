import usePopup from "@/Components/Hooks/usePopup";
import { Fragment, useState } from "react";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import { FullPushSubscription } from "./AdminTestPushPage";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "adminPushTest"];

const DeletePushSubscriptionPopup = ({
  mutate,
  node,
}: {
  node: FullPushSubscription;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();
  const [isLoading, setIsLoading] = useState(false);
  const getContent = useScopedLocale(LOCALE_NS);
  return (
    <Fragment>
      <ConfirmationPopup
        message={getContent("deletePushSubscriptionConfirmationMessage")}
        onConfirm={() => setIsLoading(true)}
        isLoading={isLoading}
      />
      <Act
        path={isLoading ? `${API}/auto/pushsubscription/${node._id}` : null}
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

export default DeletePushSubscriptionPopup;
