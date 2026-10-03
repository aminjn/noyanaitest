"use client";

import { useState } from "react";
import Act from "@/Components/UI/Act";
import Button from "@/Components/UI/Button";
import FormActions from "./FormActions";
import { API } from "@/Components/config";
import { ta } from "@/Components/Admin/i18n/adminText";

// A provider's own commission / tax record overrides the platform default
// (Lib/commission.ts, Lib/taxSettings.ts). Removing the record is the one
// way back to the default: saving an empty box would otherwise keep a 0%
// override that looks like "no setting".
const ResetToDefaultButton = ({
  segment,
  id,
  mutate,
}: {
  // the /auto segment, e.g. "doctorFinanceSettings"
  segment: string;
  id?: string;
  mutate: () => unknown;
}) => {
  const [busy, setBusy] = useState(false);
  if (!id) return null;
  return (
    <FormActions>
      <Button
        variant="Neutral"
        mode="Outline"
        isLoading={busy}
        onClick={() => setBusy(true)}
      >
        {ta("بازگشت به پیش‌فرض سیستم")}
      </Button>
      <Act
        path={busy ? `${API}/auto/${segment}/${id}` : null}
        method="PUT"
        onDone={(ok) => {
          setBusy(false);
          if (ok) mutate();
        }}
      />
    </FormActions>
  );
};

export default ResetToDefaultButton;
