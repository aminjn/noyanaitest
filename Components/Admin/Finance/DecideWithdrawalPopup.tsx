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
import { IAdminWithdrawalRow, withdrawalWalletLabel } from "./AdminFinanceWithdrawalsPage";
import { userLabel } from "./adminFinance";
import { ta } from "@/Components/Admin/i18n/adminText";

// Pay (after the bank transfer, with its reference) or reject (the held
// amount returns to the wallet it was held from - the user's, or the
// clinic's / hospital's own - with the reason shown to them).
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
      <p>{ta("${1} تومان برای ${2}", [currencize(node.amount), userLabel(node.user)])}</p>
      <p>{withdrawalWalletLabel(node)}</p>
      <p dir="ltr">{node.iban}</p>
      <p>{ta("به نام: ${1}", [node.holderName])}</p>
      <Input
        title={ta("کد پیگیری انتقال بانکی (برای واریز)")}
        onChange={(e) => setTrackingCode(e.target.value)}
      />
      <AreaInput
        title={ta("توضیح / دلیل رد (برای رد الزامی است)")}
        onChange={(e) => setNote(e.target.value)}
      />
      <FormActions>
        <Button
          variant={trackingCode.trim() ? "Success" : "Disable"}
          isLoading={decision === "paid"}
          onClick={() => trackingCode.trim() && setDecision("paid")}
        >
          {ta("واریز شد")}
        </Button>
        <Button
          variant={note.trim() ? "Error" : "Disable"}
          isLoading={decision === "rejected"}
          onClick={() => note.trim() && setDecision("rejected")}
        >
          {ta("رد و بازگشت به کیف پول")}
        </Button>
        <Button variant="Neutral" onClick={() => closePopup()}>
          {ta("انصراف")}
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
