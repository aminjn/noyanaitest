import Link from "@/Components/i18n/Link";
import { ReactNode, useEffect, useState } from "react";
import useSWR from "swr";
import classes from "./PublicMobileMenu.module.css";
import useUser from "../Hooks/useUser";
import usePopup from "../Hooks/usePopup";
import Ixon from "../UI/Ixon";
import Button from "../UI/Button";
import LogoLong from "../UI/LogoLong";
import ThemeToggle from "../UI/Theme/ThemeToggle";
import AuthPopup from "../Popups/AuthPopup";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { ContentKey } from "../Enums/contentKeys";
import {
  categoryTabs,
  CategoryLike,
  HeaderCategories,
} from "./headerCategories";
import XMarkIcon from "../Icons/XMarkIcon";
import ChevronIcon from "../Icons/ChevronIcon";
import ArrowLeftIcon from "../Icons/ArrowLeftIcon";
import CategoriesIcon from "../Icons/CategoriesIcon";
import Calendar02Icon from "../Icons/Calendar02Icon";
import StarsSolidIcon from "../Icons/StarsSolidIcon";
import BuildingIcon from "../Icons/BuildingIcon";
import BookIcon from "../Icons/BookIcon";
import InfoiCircleIcon from "../Icons/InfoiCircleIcon";
import HelpCircleIcon from "../Icons/HelpCircleIcon";
import CallingIcon from "../Icons/CallingIcon";
import MapIcon from "../Icons/MapIcon";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import HeadphoneIcon from "../Icons/HeadphoneIcon";
import UserCircleIcon from "../Icons/UserCircleIcon";
import {
  t2xsRegular,
  tbaseMedium,
  tsmMedium,
  txsMedium,
} from "../UI/Typography";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common"];

const menuItems: { title: ContentKey; target: string; icon: ReactNode }[] = [
  { title: "officeBook", target: "/book", icon: <Calendar02Icon /> },
  { title: "aiDetection", target: "/wizard", icon: <StarsSolidIcon /> },
  { title: "noyanClinic", target: "/clinic", icon: <BuildingIcon /> },
  { title: "blogs", target: "/mag", icon: <BookIcon /> },
  {
    title: "bookingGuide",
    target: "/bookingGuide",
    icon: <InfoiCircleIcon />,
  },
  { title: "faqs", target: "/faq", icon: <HelpCircleIcon /> },
  { title: "contactUs", target: "/contact", icon: <CallingIcon /> },
  { title: "aboutUs", target: "/about", icon: <MapIcon /> },
];

const PublicMobileMenu = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const getContent = useScopedLocale(LOCALE_NS);
  const { user } = useUser();
  const { setPopup } = usePopup();

  const [isCategoriesOpen, setIsCategoriesOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<keyof HeaderCategories>(
    "specialityCategories",
  );

  const { data } = useSWR<HeaderCategories>(
    `${API}/public/header`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keyup", listener, false);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keyup", listener, false);
    };
  }, [isOpen, onClose]);

  const activeTabConfig =
    categoryTabs.find((tab) => tab.key === activeTab) || categoryTabs[0];
  const activeCategories: CategoryLike[] =
    (data?.[activeTab] as CategoryLike[] | undefined) || [];

  return (
    <div
      className={`${classes.root} ${isOpen ? classes.open : ""}`}
      aria-hidden={!isOpen}
    >
      <div className={classes.backdrop} onClick={onClose} />
      <div className={classes.panel}>
        <div className={classes.top}>
          <button
            type="button"
            className={classes.closeBtn}
            onClick={onClose}
            aria-label={getContent("close")}
          >
            <Ixon width="1.125rem">
              <XMarkIcon />
            </Ixon>
          </button>
          <Link href="/" className={classes.logo} onClick={onClose}>
            <LogoLong width={104} height={36} />
          </Link>
          <ThemeToggle className={classes.theme} />
        </div>

        <div className={classes.scroll}>
          {user ? (
            <Link
              href="/dashboard"
              className={classes.profileRow}
              onClick={onClose}
            >
              <Ixon width="1.5rem">
                <UserCircleIcon />
              </Ixon>
              <span className={tbaseMedium}>{user.phone}</span>
            </Link>
          ) : (
            <Button
              className={classes.authBtn}
              variant="Primary"
              mode="Outline"
              size="L"
              radius="Medium"
              tailIcon={<ArrowLeftIcon />}
              onClick={() => {
                onClose();
                setPopup("Auth", <AuthPopup />);
              }}
            >
              {getContent("loginOrSignup")}
            </Button>
          )}

          <div className={classes.categoriesBox}>
            <button
              type="button"
              className={classes.categoriesToggle}
              onClick={() => setIsCategoriesOpen((prev) => !prev)}
            >
              <Ixon width="1.25rem" className={classes.categoriesToggleIcon}>
                <CategoriesIcon />
              </Ixon>
              <span className={tsmMedium}>{getContent("categories")}</span>
              <Ixon
                width="1rem"
                className={`${classes.chevron} ${
                  isCategoriesOpen ? classes.chevronOpen : ""
                }`}
              >
                <ChevronIcon />
              </Ixon>
            </button>
            {isCategoriesOpen && (
              <div className={classes.categoriesPanel}>
                <div className={classes.categoriesTabs}>
                  {categoryTabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`${classes.categoryTabBtn} ${txsMedium} ${
                        tab.key === activeTab
                          ? classes.categoryTabBtnActive
                          : ""
                      }`}
                    >
                      {getContent(tab.label)}
                    </button>
                  ))}
                </div>
                <Link
                  href={activeTabConfig.allTarget}
                  className={classes.categoriesAllLink}
                  onClick={onClose}
                >
                  <span className={t2xsRegular}>
                    {getContent("fullListOfX", [
                      getContent(activeTabConfig.label),
                    ])}
                  </span>
                  <Ixon width=".875rem" className={classes.categoriesChevron}>
                    <ChevronIcon />
                  </Ixon>
                </Link>
                <div className={classes.categoriesList}>
                  {activeCategories.length ? (
                    activeCategories.map((cat) => (
                      <Link
                        key={cat._id}
                        href={activeTabConfig.hrefFor(cat.slug || cat._id)}
                        className={`${classes.categoryItem} ${txsMedium}`}
                        onClick={onClose}
                      >
                        <span>{cat.title || cat.name}</span>
                      </Link>
                    ))
                  ) : (
                    <span
                      className={`${classes.categoriesEmpty} ${t2xsRegular}`}
                    >
                      {getContent("nothingWasFound")}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <nav className={classes.nav}>
            {menuItems.map((item) => (
              <Link
                key={item.title}
                href={item.target}
                className={classes.navItem}
                onClick={onClose}
              >
                <Ixon width="1.25rem" className={classes.navItemIcon}>
                  {item.icon}
                </Ixon>
                <span className={tsmMedium}>{getContent(item.title)}</span>
              </Link>
            ))}
          </nav>

          <div className={classes.ctas} onClick={onClose}>
            <Button
              href="/onboarding"
              variant="Error"
              mode="Outline"
              size="L"
              radius="Medium"
              leadIcon={<StetoscopeIcon />}
            >
              {getContent("doctorsAndMedicalCenters")}
            </Button>
            <Button
              href={user ? "/dashboard/support" : "/contact"}
              variant="Primary"
              mode="Fill"
              size="L"
              radius="Medium"
              leadIcon={<HeadphoneIcon />}
            >
              {getContent("contactSupport")}
            </Button>
          </div>
        </div>

        <div className={classes.footer}>
          <p className={`${classes.footerHours} ${t2xsRegular}`}>
            {getContent("supportWorkingHours")}
          </p>
          <div className={classes.footerContacts}>
            <a
              className={`${classes.footerContact} ${t2xsRegular}`}
              href={`mailto:${getContent("mailValue")}`}
            >
              {getContent("mailLabel")}
            </a>
            <a
              className={`${classes.footerContact} ${t2xsRegular}`}
              href={`tel:${getContent("mobileValue")}`}
            >
              {getContent("mobileLabel")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicMobileMenu;
