"use client";

import { useState } from "react";
import PopupCard from "@/Components/UI/PopupCard";
import Button from "@/Components/UI/Button";
import Input from "@/Components/UI/Input";
import AreaInput from "@/Components/UI/AreaInput";
import usePopup from "@/Components/Hooks/usePopup";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { CenterDepartment } from "./useCenterDoctors";
import classes from "./CenterDoctorsPage.module.css";

const NS: ContentNamespace[] = ["common", "centerDoctors"];

// add or edit one of the centre's departments (a hospital's ward)
const DepartmentPopup = ({
  node,
  onSave,
}: {
  node?: CenterDepartment;
  onSave: (payload: { name: string; summary: string; phone: string }) => Promise<boolean>;
}) => {
  const getContent = useScopedLocale(NS);
  const { closePopup } = usePopup();
  const [name, setName] = useState(node?.name || "");
  const [summary, setSummary] = useState(node?.summary || "");
  const [phone, setPhone] = useState(node?.phone || "");
  const [saving, setSaving] = useState(false);
  return (
    <PopupCard title={getContent(node ? "cdEditDepartment" : "cdAddDepartment")}>
      <form
        className={classes.popupBody}
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim() || saving) return;
          setSaving(true);
          const ok = await onSave({ name: name.trim(), summary: summary.trim(), phone: phone.trim() });
          setSaving(false);
          if (ok) closePopup();
        }}
      >
        <Input
          title={getContent("cdDepartmentName")}
          defaultValue={node?.name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <AreaInput
          title={getContent("summary")}
          defaultValue={node?.summary}
          onChange={(e) => setSummary(e.target.value)}
        />
        <Input
          title={getContent("phone")}
          defaultValue={node?.phone}
          onChange={(e) => setPhone(e.target.value)}
          inputMode="tel"
        />
        <div className={classes.popupActions}>
          <Button type="submit" variant="Primary" isLoading={saving}>
            {getContent("cdSave")}
          </Button>
          <Button type="button" variant="Neutral" onClick={() => closePopup()}>
            {getContent("cancel")}
          </Button>
        </div>
      </form>
    </PopupCard>
  );
};

export default DepartmentPopup;
