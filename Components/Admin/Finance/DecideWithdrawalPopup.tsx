import { useState } from "react";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import { currencize } from "@/Components/helpers/currencize";
import Act from "@/Components/UI/Act";
import Button from "@/Components/UI/Button";
import Input from "@/Components/UI/Input";
import AreaInput from "@/Components/UI/AreaInput";
import Box from "../UI/Box";
import FormActions from "../UI/FormActions";
import { IAdminWithdrawalRow } from "./AdminFinanceWithdrawalsPage";
import { userLabel } from "./adminFinance";

// Pay (after the bank transfer, with its reference) or reject (the held
// amount returns to the user's wallet, with the reason shown to them).
const DecideWithdrawalPopup = ({
  node,
  mutate,
}: {
  node: IAdminWithdrawalRow;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();
  const [trackingCode, setTrackingCode] = useState("");
  const [note, setNote] = useState("");
  const [decision, setDecision] = useState<"paid" | "rejected" | null>(null);
  return (
    <Box>
      <p>{`${currencize(node.amount)} تومان برای ${userLabel(node.user)}`}</p>
      <p dir="ltr">{node.iban}</p>
      <p>{`به نام: ${node.holderName}`}</p>
      <Input
        title="کد پیگیری انتقال بانکی (برای واریز)"
        onChange={(e) => setTrackingCode(e.target.value)}
      />
      <AreaInput
        title="توضیح / دلیل رد (برای رد الزامی است)"
        onChange={(e) => setNote(e.target.value)}
      />
      <FormActions>
        <Button
          variant={trackingCode.trim() ? "Success" : "Disable"}
          isLoading={decision === "paid"}
          onClick={() => trackingCode.trim() && setDecision("paid")}
        >
          واریز شد
        </Button>
        <Button
          variant={note.trim() ? "Error" : "Disable"}
          isLoading={decision === "rejected"}
          onClick={() => note.trim() && setDecision("rejected")}
        >
          رد و بازگشت به کیف پول
        </Button>
        <Button variant="Neutral" onClick={() => closePopup()}>
          انصراف
        </Button>
      </FormActions>
      <Act
        path={
          decision
            ? `${API}/admin/finance/withdrawals/${node._id}/decide`
            : null
        }
        method="POST"
        payload={{
          decision: decision || undefined,
          ...(trackingCode.trim() && { trackingCode: trackingCode.trim() }),
          ...(note.trim() && { note: note.trim() }),
        }}
        onDone={(status) => {
          setDecision(null);
          if (!status) return;
          mutate();
          closePopup();
        }}
      />
    </Box>
  );
};

export default DecideWithdrawalPopup;
