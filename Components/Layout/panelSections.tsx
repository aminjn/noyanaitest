import { ReactNode } from "react";
import WalletIcon from "@/Components/Icons/WalletIcon";
import PeopleIcon from "@/Components/Icons/PeopleIcon";
import DashboardIcon from "@/Components/Icons/DashboardIcon";
import ReceiptIcon from "@/Components/Icons/ReceiptIcon";
import FileIcon from "@/Components/Icons/FileIcon";
import BookOpenIcon from "@/Components/Icons/BookOpenIcon";
import UserGroupIcon from "@/Components/Icons/UserGroupIcon";
import PackageIcon from "@/Components/Icons/PackageIcon";
import ShieldCheckIcon from "@/Components/Icons/ShieldCheckIcon";
import MedicalReportIcon from "@/Components/Icons/MedicalReportIcon";
import ArrowCircleDownIcon from "@/Components/Icons/ArrowCircleDownIcon";
import TagIcon from "@/Components/Icons/TagIcon";
import UserCheckIcon from "@/Components/Icons/UserCheckIcon";
import CategoriesIcon from "@/Components/Icons/CategoriesIcon";
import SendIcon from "@/Components/Icons/SendIcon";
import SparkIcon from "@/Components/Icons/SparkIcon";
import ClockIcon from "@/Components/Icons/ClockIcon";
import EditSquareIcon from "@/Components/Icons/EditSquareIcon";
import { ContentKey } from "../Enums/contentKeys";
import { LinkMapItem } from "./PanelSidebar";

// The two sections every provider panel's menu has since 2026-10, so the
// six sidebars cannot drift apart:
//   «مالی و حسابداری» - one place for all the practice's money (it used to
//     be five separate top-level items): overview, wallet and settlement,
//     invoices, receipts and payments, expenses, insurance claims,
//     accounting, Moadian, payroll, inventory, reports;
//   «ارتباط با بیماران» - the CRM (Components/_Common/Business/Crm).
// Every child keeps the access it had as a top-level item; a panel's
// licence gate still decides what a page shows.

const k = (key: string) => key as ContentKey;

export const financeSection = <A extends string>({
  hasAccess,
  group,
  inventory,
  insurance,
  walletSide,
}: {
  // the panel's useAcl checker
  hasAccess: (action?: A) => boolean;
  group?: ContentKey;
  // the panel keeps stock (pharmacy, lab, clinic, hospital)
  inventory: boolean;
  // the panel bills insurers (every panel but the insurer's own)
  insurance: boolean;
  // the wallet balance shown beside its item
  walletSide?: ReactNode;
}): LinkMapItem => {
  const can = (a: string) => hasAccess(a as A);
  const finance = can("readFinance");
  return {
    title: k("financeSectionMenu"),
    icon: <WalletIcon />,
    group,
    show: true,
    children: [
      { title: k("finNavOverview"), icon: <DashboardIcon />, target: "finance", show: finance },
      { title: k("finNavWallet"), icon: <WalletIcon />, target: "finance/wallet", side: walletSide, show: finance },
      { title: k("finNavInvoices"), icon: <FileIcon />, target: "finance/invoices", show: finance },
      { title: k("finNavPayments"), icon: <ArrowCircleDownIcon />, target: "finance/payments", show: finance },
      { title: k("finNavExpenses"), icon: <TagIcon />, target: "finance/expenses", show: finance },
      { title: k("finNavInsurance"), icon: <ShieldCheckIcon />, target: "finance/insurance", show: finance && insurance },
      { title: "accounting", icon: <BookOpenIcon />, target: "finance/accounting", show: finance },
      { title: "moadianMenu", icon: <ReceiptIcon />, target: "finance/moadian", show: can("readMoadian") },
      { title: "payMenu", icon: <UserGroupIcon />, target: "finance/payroll", show: can("readPayroll") },
      { title: "invMenu", icon: <PackageIcon />, target: "finance/inventory", show: inventory && can("readInventory") },
      { title: k("finNavReports"), icon: <MedicalReportIcon />, target: "finance/reports", show: finance },
    ],
  };
};

export const crmSection = <A extends string>({ hasAccess, group }: { hasAccess: (action?: A) => boolean; group?: ContentKey }): LinkMapItem => {
  const crm = hasAccess("readCrm" as A);
  return {
    title: k("crmSectionMenu"),
    icon: <PeopleIcon />,
    group,
    show: crm,
    children: [
      { title: k("crmNavDashboard"), icon: <DashboardIcon />, target: "crm", show: crm },
      { title: k("crmNavContacts"), icon: <UserCheckIcon />, target: "crm/contacts", show: crm },
      { title: k("crmNavSegments"), icon: <CategoriesIcon />, target: "crm/segments", show: crm },
      { title: k("crmNavCampaigns"), icon: <SendIcon />, target: "crm/campaigns", show: crm },
      { title: k("crmNavAutomations"), icon: <SparkIcon />, target: "crm/automations", show: crm },
      { title: k("crmNavFollowups"), icon: <ClockIcon />, target: "crm/followups", show: crm },
      { title: k("crmNavTemplates"), icon: <EditSquareIcon />, target: "crm/templates", show: crm },
    ],
  };
};
