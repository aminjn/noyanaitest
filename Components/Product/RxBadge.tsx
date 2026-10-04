import Badge, { BadgeSize } from "../UI/Badge";
import DocumentIcon from "../Icons/DocumentIcon";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { ContentKey } from "../Enums/contentKeys";

const NS: ContentNamespace[] = ["common"];

// «نسخه لازم است» (2026-10): a prescription-only product or package - the
// product page, the cart and the order lines show it, and checkout asks for
// an e-prescription code or a photo of the paper prescription
const RxBadge = ({ size = "S", className }: { size?: BadgeSize; className?: string }) => {
  const getContent = useScopedLocale(NS);
  return (
    <Badge
      color="Warning"
      mode="Fill"
      radius="High"
      size={size}
      leadIcon={<DocumentIcon />}
      className={className}
    >
      {getContent("rxRequired")}
    </Badge>
  );
};

export default RxBadge;
