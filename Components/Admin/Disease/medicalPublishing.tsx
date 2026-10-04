"use client";

import { API } from "@/Components/config";
import { ta } from "@/Components/Admin/i18n/adminText";
import { getDoctorProfileLabel } from "../Lib/LabelGetters";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import { MedicalReviewer } from "./AdminManageDiseasesPage";

// The publish switch and the medical review of an encyclopedia page
// (disease, drug, symptom), the same three fields in each editor. The page
// shows "medically reviewed by Dr X" only when a reviewer is set here
// (backend Lib/medicalContent.ts); the date is filled in on save when left
// empty.
export const medicalPublishFields = <
  T extends {
    published?: boolean;
    reviewedBy?: string | MedicalReviewer;
    reviewedAt?: string;
  },
>(
  section: string,
) => ({
  published: {
    section,
    type: "bool" as const,
    title: ta("منتشرشده"),
  },
  reviewedBy: {
    section,
    type: "nodes" as const,
    title: ta("پزشک بازبینی‌کننده"),
    multi: false,
    clearable: true,
    path: `${API}/auto/doctorprofile?active=true`,
    getOptionLabel: (node: unknown) =>
      getDoctorProfileLabel(node as IDoctorProfile),
    getOptionValue: (node: unknown) => (node as IDoctorProfile)._id,
    getDefaultValue: (node: T) =>
      typeof node.reviewedBy === "object"
        ? node.reviewedBy?._id
        : node.reviewedBy,
  },
  reviewedAt: {
    section,
    type: "date" as const,
    title: ta("تاریخ بازبینی"),
  },
});
