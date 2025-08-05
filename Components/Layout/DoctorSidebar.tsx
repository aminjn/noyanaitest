import Link from "next/link";
import classes from "./DoctorSidebar.module.css";
import Image from "next/image";
import { imagePath } from "../helpers/imagepath";
import useUser from "../Hooks/useUser";
import Loading from "../Admin/UI/Loading";
import Ixon from "../UI/Ixon";
import ChevronIcon from "../Icons/ChevronIcon";
import { Fragment, ReactNode, useMemo } from "react";
import { ContentKey } from "../Enums/contentKeys";
import useLocale from "../Hooks/useLocale";
import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import DashboardIcon from "../Icons/DashboardIcon";
import WalletIcon from "../Icons/WalletIcon";
import UserEditIcon from "../Icons/UserEditIcon";
import CalendarIcon from "../Icons/CalendarIcon";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import CartIcon from "../Icons/CartIcon";
import HospitalIcon from "../Icons/HospitalIcon";
import BuildingIcon from "../Icons/BuildingIcon";
import ShieldCheckIcon from "../Icons/ShieldCheckIcon";
import ReceiptIcon from "../Icons/ReceiptIcon";
import DiscountIcon from "../Icons/DicountIcon";
import FileDuplicateIcon from "../Icons/FileDuplicateIcon";
import ChatIcon from "../Icons/ChatIcon";
import PillIcon from "../Icons/PillIcon";
import MedicalRecordIcon from "../Icons/MedicalRecordIcon";
import LogoutIcon from "../Icons/LogoutIcon";
import { currencize } from "../helpers/currencize";
import { usePathname } from "next/navigation";

type LinkMapItem = {
  icon: ReactNode;
  title: ContentKey;
  className?: string;
  side?: ReactNode;
} & (
  | { target: string; onClick?: never }
  | { onClick: () => unknown; target?: never }
);

type LinkMap = LinkMapItem[];

const LinkItem = ({
  item: { icon, title, className, onClick, side, target },
}: {
  item: LinkMapItem;
}) => {
  const getContent = useLocale();
  const pathname = usePathname();

  const isActive = useMemo<boolean>(() => {
    if (target === undefined) return false;
    const cleaned = pathname.replaceAll("/", "").replaceAll("doctorpanel", "");
    if (!target) return cleaned === "";
    return cleaned.startsWith(target);
  }, [pathname, target]);

  const content = useMemo(
    () => (
      <Fragment>
        <Ixon width="1.25rem">{icon}</Ixon>
        <span>{getContent(title)}</span>
        {!!side && <span className={classes.side}>{side}</span>}
      </Fragment>
    ),
    [getContent, icon, side, title]
  );

  return (
    <Fragment>
      {target !== undefined ? (
        <Link
          className={`${classes.link} ${
            isActive ? classes.activeLink : ""
          } ${className}`}
          href={`/doctorpanel/${target}`}
        >
          {content}
        </Link>
      ) : (
        <button className={`${classes.link} ${className}`} onClick={onClick}>
          {content}
        </button>
      )}
    </Fragment>
  );
};

const DoctorSidebar = () => {
  const { user } = useUser();

  const { data: balance } = useSWR<number>(`${API}/finance`, (url: string) =>
    fetcher({ url }).then((res) => res.data)
  );

  const getContent = useLocale();

  const links = useMemo<LinkMap>(
    () => [
      { title: "dashboard", icon: <DashboardIcon />, target: "" },
      {
        title: "financialMangement",
        icon: <WalletIcon />,
        target: "finance",
        side: (
          <span className={classes.balance}>
            <span>{currencize(balance || 0)}</span>
            <span className={classes.toman}>{getContent("toman")}</span>
          </span>
        ),
      },
      { title: "secrataries", icon: <UserEditIcon />, target: "secretary" },
      { title: "bookingCalendar", icon: <CalendarIcon />, target: "calendar" },
      { title: "patients", icon: <StetoscopeIcon />, target: "patient" },
      { title: "licenses", icon: <CartIcon />, target: "license" },
      { title: "clinics", icon: <HospitalIcon />, target: "clinic" },
      {
        title: "phrmaciesAndLabs",
        icon: <BuildingIcon />,
        target: "pharmacy",
      },
      { title: "insurances", icon: <ShieldCheckIcon />, target: "insurance" },
      { title: "offers", icon: <ReceiptIcon />, target: "offer" },
      { title: "discounts", icon: <DiscountIcon />, target: "discount" },
      { title: "articles", icon: <FileDuplicateIcon />, target: "article" },
      { title: "chatWithPatients", icon: <ChatIcon />, target: "chat" },
      { title: "drugsAndPrescriptions", icon: <PillIcon />, target: "drug" },
      {
        title: "patientDocuments",
        icon: <MedicalRecordIcon />,
        target: "document",
      },
      {
        title: "logout",
        icon: <LogoutIcon />,
        onClick: () => {},
        className: classes.logout,
      },
    ],
    [balance, getContent]
  );

  if (!user) return <Loading />;
  return (
    <div className={classes.main}>
      <Link href="/doctorpanel/profile" className={classes.user}>
        <div>
          <Image src={imagePath("")} alt="" />
        </div>
        <div className={classes.userDetails}>
          <span className={classes.userName}>{user.userName || "کاربر"}</span>
          <span className={classes.userPhone}>{user.phone}</span>
        </div>
        <Ixon width="1.5rem" style={{ transform: "rotateZ(90deg)" }}>
          <ChevronIcon />
        </Ixon>
      </Link>
      <div className={classes.bar}>
        {links.map((item) => (
          <LinkItem item={item} key={`${item.target}${item.title}`} />
        ))}
      </div>
    </div>
  );
};

export default DoctorSidebar;
