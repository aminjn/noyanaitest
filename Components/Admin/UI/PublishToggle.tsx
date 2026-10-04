"use client";

import useForm from "@/Components/Hooks/useForm";
import { API } from "@/Components/config";
import BooleanToIcon from "@/Components/UI/BooleanToIcon";
import { ta } from "@/Components/Admin/i18n/adminText";

// A record's "on the site" switch, right in its list row: one click
// publishes or hides it (a page under rewrite comes off the site without
// being deleted). The label is the current state; the tooltip the action.
const PublishToggle = ({
  modelName,
  _id,
  value,
  mutate,
  field = "published",
  disabled,
}: {
  modelName: string;
  _id: string;
  value: boolean;
  mutate: () => unknown;
  field?: string;
  disabled?: boolean;
}) => {
  const { submit, isLoading } = useForm<Record<string, boolean>>({
    path: `${API}/auto/${modelName}/${_id}`,
    method: "POST",
    parser: "JSON",
    decorators: { [field]: !value },
    successCb: () => mutate(),
  });
  return (
    <button
      type="button"
      onClick={() => !isLoading && !disabled && submit()}
      disabled={isLoading || disabled}
      title={value ? ta("پنهان کردن") : ta("انتشار")}
      style={{
        background: "none",
        border: 0,
        padding: 0,
        cursor: disabled ? "default" : "pointer",
        opacity: isLoading ? 0.5 : 1,
      }}
    >
      <BooleanToIcon value={value} />
    </button>
  );
};

export default PublishToggle;
