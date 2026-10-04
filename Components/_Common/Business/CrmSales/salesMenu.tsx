import { ReactNode } from "react";
import FilterIcon from "@/Components/Icons/FilterIcon";
import FileIcon from "@/Components/Icons/FileIcon";
import MedicalReportIcon from "@/Components/Icons/MedicalReportIcon";
import RetryIcon from "@/Components/Icons/RetryIcon";
import CallCallingIcon from "@/Components/Icons/CallCallingIcon";
import TargetIcon from "@/Components/Icons/TargetIcon";
import DashboardIcon from "@/Components/Icons/DashboardIcon";
import EditSquareIcon from "@/Components/Icons/EditSquareIcon";
import FileDuplicateIcon from "@/Components/Icons/FileDuplicateIcon";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { partKey, Profile, PROFILES, SalesPage, salesParts } from "./salesShared";

// The sales side's items in the «ارتباط با بیماران» submenu, only the
// profile's own parts and in its own words (salesShared PROFILES).
const icons: Partial<Record<SalesPage, ReactNode>> = {
  pipeline: <FilterIcon />,
  inquiries: <EditSquareIcon />,
  plans: <MedicalReportIcon />,
  contracts: <FileIcon />,
  carePlans: <RetryIcon />,
  calls: <CallCallingIcon />,
  targets: <TargetIcon />,
  reports: <DashboardIcon />,
  settings: <FileDuplicateIcon />,
};

export const salesMenu = (profile: Profile | undefined, show: boolean) => {
  if (!profile) return [];
  const own = PROFILES[profile].parts;
  return salesParts
    .filter((p) => own.includes(p.page))
    .map((p) => ({ title: partKey(profile, p.title) as ContentKey, icon: icons[p.page], target: `crm${p.path}`, show }));
};
