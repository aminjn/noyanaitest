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
import MedalStarIcon from "@/Components/Icons/MedalStarIcon";
import SendLineIcon from "@/Components/Icons/SendLineIcon";
import PuzzleIcon from "@/Components/Icons/PuzzleIcon";
import DoubleCheckIcon from "@/Components/Icons/DoubleCheckIcon";
import CommentIcon from "@/Components/Icons/CommentIcon";
import CheckSquareIcon from "@/Components/Icons/CheckSquareIcon";
import Calendar01Icon from "@/Components/Icons/Calendar01Icon";
import Tick02Icon from "@/Components/Icons/Tick02Icon";
import BookAltIcon from "@/Components/Icons/BookAltIcon";
import RetryIcon from "@/Components/Icons/RetryIcon";
import { CrmProfile, partOn, partTitle, ServicePart } from "@/Components/_Common/Business/Crm/Service/profiles";
import { salesMenu } from "@/Components/_Common/Business/CrmSales/salesMenu";
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

export type FinanceProfile = "doctor" | "clinic" | "hospital" | "pharmacy" | "paraClinic" | "insurance";

// (2026-10, the per-profile work) each profile gets the finance menu its
// work needs, in its own order: a doctor's is a simple book (no fixed-asset
// desk or approval desk), a pharmacy puts payments and cheques, the
// treasury and the stock with expiry first, an insurer puts its claims and
// provider settlements first. The plan's modules still gate each page.
const FINANCE_ORDER: Record<FinanceProfile, string[]> = {
  doctor: ["overview", "wallet", "invoices", "payments", "expenses", "insurance", "accounting", "treasury", "moadian", "payroll", "reports"],
  clinic: ["overview", "wallet", "invoices", "insurance", "payments", "expenses", "accounting", "treasury", "assets", "requests", "inventory", "payroll", "moadian", "reports"],
  hospital: ["overview", "wallet", "invoices", "insurance", "payments", "expenses", "accounting", "treasury", "assets", "requests", "inventory", "payroll", "moadian", "reports"],
  pharmacy: ["overview", "wallet", "payments", "treasury", "inventory", "insurance", "invoices", "expenses", "accounting", "assets", "requests", "moadian", "payroll", "reports"],
  paraClinic: ["overview", "wallet", "invoices", "insurance", "payments", "inventory", "expenses", "accounting", "treasury", "assets", "requests", "payroll", "moadian", "reports"],
  insurance: ["overview", "settlements", "payments", "accounting", "treasury", "requests", "expenses", "invoices", "wallet", "payroll", "moadian", "reports"],
};

export const financeSection = <A extends string>({
  hasAccess,
  group,
  inventory,
  insurance,
  walletSide,
  profile = "doctor",
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
  profile?: FinanceProfile;
}): LinkMapItem => {
  const can = (a: string) => hasAccess(a as A);
  const finance = can("readFinance");
  const items: Record<string, LinkMapItem> = {
    overview: { title: k("finNavOverview"), icon: <DashboardIcon />, target: "finance", show: finance },
    wallet: { title: k("finNavWallet"), icon: <WalletIcon />, target: "finance/wallet", side: walletSide, show: finance },
    invoices: { title: k("finNavInvoices"), icon: <FileIcon />, target: "finance/invoices", show: finance },
    payments: { title: k("finNavPayments"), icon: <ArrowCircleDownIcon />, target: "finance/payments", show: finance },
    expenses: { title: k("finNavExpenses"), icon: <TagIcon />, target: "finance/expenses", show: finance },
    insurance: { title: k("finNavInsurance"), icon: <ShieldCheckIcon />, target: "finance/insurance", show: finance && insurance },
    accounting: { title: "accounting", icon: <BookOpenIcon />, target: "finance/accounting", show: finance },
    treasury: { title: k("finNavTreasury"), icon: <WalletIcon />, target: "finance/treasury", show: finance },
    // the insurer's provider settlements: the treasury's settlements tab
    settlements: { title: k("finNavProviderSettlements"), icon: <ShieldCheckIcon />, target: "finance/treasury?tab=settlements", show: finance },
    assets: { title: k("finNavAssets"), icon: <PackageIcon />, target: "finance/assets", show: finance },
    requests: { title: k("finNavRequests"), icon: <EditSquareIcon />, target: "finance/requests", show: finance },
    moadian: { title: "moadianMenu", icon: <ReceiptIcon />, target: "finance/moadian", show: can("readMoadian") },
    payroll: { title: "payMenu", icon: <UserGroupIcon />, target: "finance/payroll", show: can("readPayroll") },
    inventory: { title: "invMenu", icon: <PackageIcon />, target: "finance/inventory", show: inventory && can("readInventory") },
    reports: { title: k("finNavReports"), icon: <MedicalReportIcon />, target: "finance/reports", show: finance },
  };
  return {
    title: k("financeSectionMenu"),
    icon: <WalletIcon />,
    group,
    show: true,
    children: FINANCE_ORDER[profile].map((key) => items[key]).filter(Boolean),
  };
};

export const crmSection = <A extends string>({
  hasAccess,
  group,
  profile,
}: {
  hasAccess: (action?: A) => boolean;
  group?: ContentKey;
  // the panel's profile: which engagement and service parts it gets
  // (Crm/Service/profiles.ts; a doctor's team parts show in the section
  // itself once there is staff)
  profile?: CrmProfile;
}): LinkMapItem => {
  const crm = hasAccess("readCrm" as A);
  const part = (p: ServicePart, title: string, icon: ReactNode, target: string) => ({
    title: k(partTitle(profile, title, p)),
    icon,
    target,
    show: crm && partOn(profile, p, profile !== "doctor"),
  });
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
      // the sales side, per profile (docs/nexxa-crm-parity.md)
      ...salesMenu(profile, crm),
      // engagement and service (docs/nexxa-crm-engagement-parity.md)
      part("club", "crmeNavClub", <MedalStarIcon />, "crm/club"),
      part("sequences", "crmeNavSequences", <SendLineIcon />, "crm/sequences"),
      part("flows", "crmeNavFlows", <PuzzleIcon />, "crm/flows"),
      part("inbox", "crmeNavInbox", <DoubleCheckIcon />, "crm/inbox"),
      part("tickets", "crmeNavTickets", <CommentIcon />, "crm/tickets"),
      part("tasks", "crmeNavTasks", <CheckSquareIcon />, "crm/tasks"),
      part("calendar", "crmeNavCalendar", <Calendar01Icon />, "crm/calendar"),
      part("checklists", "crmeNavChecklists", <Tick02Icon />, "crm/checklists"),
      part("knowledge", "crmeNavKnowledge", <BookAltIcon />, "crm/knowledge"),
      part("returns", "crmeNavReturns", <RetryIcon />, "crm/returns"),
    ],
  };
};
