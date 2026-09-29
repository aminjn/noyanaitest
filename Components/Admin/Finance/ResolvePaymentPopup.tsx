import { useState } from "react";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import { currencize } from "@/Components/helpers/currencize";
import Act from "@/Components/UI/Act";
import Button from "@/Components/UI/Button";
import AreaInput from "@/Components/UI/AreaInput";
import Box from "../UI/Box";
import FormActions from "../UI/FormActions";
import { IAdminPaymentRow } from "./AdminFinancePaymentsPage";
import { userLabel } from "./adminFinance";

// A "needsReview" payment: the card was charged, but crediting the wallet
// and the automatic reverse both failed. The admin either credits the wallet
// now or records that the money was returned to the card by hand.
const ResolvePaymentPopup = ({
  node,
  mutate,
}: {
  node: IAdminPaymentRow;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();
  const [note, setNote] = useState("");
  const [resolution, setResolution] = useState<"credit" | "refunded" | null>(
    null,
  );
  const noteOk = note.trim().length >= 3;
  return (
    <Box>
      <p>
        {`پرداخت ${currencize(node.amount || 0)} تومانی ${userLabel(node.user)} (کد پیگیری ${node.rrn || node.refNum || "—"}) از کارت کسر شده، اما نه به کیف پول رسیده و نه به کارت برگشته است.`}
      </p>
      <AreaInput
        title="توضیح (الزامی، در لاگ ثبت می‌شود)"
        required
        onChange={(e) => setNote(e.target.value)}
      />
      <FormActions>
        <Button
          variant={noteOk ? "Primary" : "Disable"}
          isLoading={resolution === "credit"}
          onClick={() => noteOk && setResolution("credit")}
        >
          واریز به کیف پول کاربر
        </Button>
        <Button
          variant={noteOk ? "Secondary" : "Disable"}
          isLoading={resolution === "refunded"}
          onClick={() => noteOk && setResolution("refunded")}
        >
          به کارت برگشت داده شد
        </Button>
        <Button variant="Neutral" onClick={() => closePopup()}>
          انصراف
        </Button>
      </FormActions>
      <Act
        path={
          resolution
            ? `${API}/admin/finance/payments/${node._id}/resolve`
            : null
        }
        method="POST"
        payload={{ resolution: resolution || undefined, note: note.trim() }}
        onDone={(status) => {
          setResolution(null);
          if (!status) return;
          mutate();
          closePopup();
        }}
      />
    </Box>
  );
};

export default ResolvePaymentPopup;
