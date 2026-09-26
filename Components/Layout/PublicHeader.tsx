import Link from "@/Components/i18n/Link";
import LogoLong from "../UI/LogoLong";
import classes from "./PublicHeader.module.css";
import UserButton from "./UserButton";
import LanguageSwitcher from "../i18n/LanguageSwitcher";
import { usePathname } from "@/Components/i18n/navigation";
import { Fragment, ReactNode, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import Ixon from "../UI/Ixon";
import ChevronIcon from "../Icons/ChevronIcon";
import CallingIcon from "../Icons/CallingIcon";
import ChatBubbleIcon from "../Icons/ChatBubbleIcon";
import { ContentKey } from "../Enums/contentKeys";
import SearchIcon from "../Icons/SearchIcon";
import Bell01Icon from "../Icons/Bell01Icon";
import SearchButton from "./SearchButton";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import {
  t2xsRegular,
  tsmMedium,
  txsMedium,
  txsRegular,
} from "../UI/Typography";
import useUser from "../Hooks/useUser";
import useProgress from "../Hooks/useProgress";
import NotificationButton from "./NotificationButton";
import CartIcon from "../Icons/CartIcon";
import CartButton from "./CartButton";
import BarsIcon from "../Icons/BarsIcon";
import PublicMobileMenu from "./PublicMobileMenu";
import {
  HeaderCategories,
  categoryTabs,
  CategoryLike,
} from "./headerCategories";
import SearchModal from "./SearchModal";
import XMarkIcon from "../Icons/XMarkIcon";
import LineBagIcon from "../Icons/LinebagIcon";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common"];

const NavLink = ({
  target,
  title,
  accent,
}: {
  target: string;
  title: ContentKey;
  accent?: boolean;
}) => {
  const pathname = usePathname();
  const getContent = useScopedLocale(LOCALE_NS);

  return (
    <Link
      href={target}
      className={`${classes.link} ${
        pathname === target ? classes.active : ""
      } ${accent ? classes.accent : ""} ${tsmMedium}`}
    >
      {getContent(title)}
    </Link>
  );
};

const Categories = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<keyof HeaderCategories>(
    "specialityCategories",
  );

  const { data } = useSWR<HeaderCategories>(
    `${API}/public/header`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (
        !containerRef.current ||
        !e.target ||
        !containerRef.current.contains(e.target as Node)
      )
        return setIsOpen(false);
    };
    window.addEventListener("click", listener, false);
    return () => window.removeEventListener("click", listener, false);
  }, []);

  const getContent = useScopedLocale(LOCALE_NS);

  const activeTabConfig =
    categoryTabs.find((tab) => tab.key === activeTab) || categoryTabs[0];
  const activeCategories: CategoryLike[] =
    (data?.[activeTab] as CategoryLike[] | undefined) || [];

  return (
    <div className={classes.categoriesContainer} ref={containerRef}>
      <button
        style={{ height: "unset" }}
        className={`${classes.subedBtn} ${classes.link}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>{getContent("categories")}</span>
        <Ixon width="1rem">
          <ChevronIcon />
        </Ixon>
      </button>
      {isOpen && (
        <div className={classes.categoriesDropdown}>
          <div className={classes.categoriesTabs}>
            {categoryTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`${classes.categoryTabBtn} ${txsMedium} ${
                  tab.key === activeTab ? classes.categoryTabBtnActive : ""
                }`}
              >
                {getContent(tab.label)}
              </button>
            ))}
          </div>
          <div className={classes.categoriesDivider} />
          <div className={classes.categoriesContent}>
            <Link
              href={activeTabConfig.allTarget}
              className={classes.categoriesAllLink}
              onClick={() => setIsOpen(false)}
            >
              <span className={t2xsRegular}>
                {getContent("fullListOfX", [getContent(activeTabConfig.label)])}
              </span>
              <Ixon width=".875rem" className={classes.categoriesChevron}>
                <ChevronIcon />
              </Ixon>
            </Link>
            <div className={classes.categoriesWrap}>
              {activeCategories.length ? (
                activeCategories.map((cat) => (
                  <Link
                    key={cat._id}
                    href={activeTabConfig.hrefFor(cat.slug || cat._id)}
                    className={`${classes.categoryItem} ${txsMedium}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <span>{cat.title || cat.name}</span>
                    <Ixon width=".875rem" className={classes.categoriesChevron}>
                      <ChevronIcon />
                    </Ixon>
                  </Link>
                ))
              ) : (
                <span className={`${classes.categoriesEmpty} ${t2xsRegular}`}>
                  {getContent("nothingWasFound")}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const WithSubs = ({
  title,
  subs,
}: {
  title: ContentKey;
  subs: { title: ContentKey; taregt: string; icon?: ReactNode }[];
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const getContent = useScopedLocale(LOCALE_NS);

  useEffect(() => {
    if (isOpen) {
      const listener = () => setIsOpen(false);
      document.addEventListener("click", listener, false);
      return () => document.removeEventListener("click", listener, false);
    }
  }, [isOpen]);

  return (
    <div className={classes.link}>
      <button className={classes.subedBtn} onClick={() => setIsOpen(true)}>
        <span>{getContent(title)}</span>
        <Ixon width="1rem">
          <ChevronIcon />
        </Ixon>
      </button>
      {isOpen && (
        <div className={classes.subs}>
          {subs.map((sub) => (
            <Link key={sub.title} href={sub.taregt} className={classes.sub}>
              {!!sub.icon && (
                <Ixon className={classes.subIcon} width="1.125rem">
                  {sub.icon}
                </Ixon>
              )}
              <span>{getContent(sub.title)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const modals = ["search", "cart", "notification"] as const;

type Modal = (typeof modals)[number];

const modalLabels: Record<Modal, ContentKey> = {
  cart: "cart",
  notification: "notifications",
  search: "search",
};

const modalIcons: Record<Modal, ReactNode> = {
  cart: <LineBagIcon />,
  search: <SearchIcon />,
  notification: <Bell01Icon />,
};

const PublicHeader = () => {
  const { user } = useUser();

  const push = useProgress();

  const getContent = useScopedLocale(LOCALE_NS);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const [openModel, setOpenModel] = useState<Modal | null>(null);

  return (
    <Fragment>
      <div className={classes.container}>
        <header className={classes.main}>
          <div className={classes.start}>
            <button
              type="button"
              className={classes.burgerBtn}
              aria-label={getContent("menu")}
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Ixon width="1.25rem">
                <BarsIcon />
              </Ixon>
            </button>
            <Link className={classes.right} href={"/"}>
              <LogoLong />
            </Link>
          </div>
          <nav className={classes.nav}>
            <NavLink title="homePage" target="/" />
            <Categories />
            <NavLink title="officeBook" target="/book" />
            <NavLink title="aiDetection" target="/wizard" />
            <NavLink title="noyanClinic" target="/product" />
            <WithSubs
              title="more"
              subs={[
                { title: "blogs", taregt: "/mag" },
                { title: "bookingGuide", taregt: "/bookingGuide" },
                { title: "faqs", taregt: "/faq" },
                { title: "contactUs", taregt: "/contact" },
                { title: "aboutUs", taregt: "/about" },
              ]}
            />
            <NavLink title="forDoctors" target="/onboarding" accent />
          </nav>
          <div className={classes.left}>
            <div
              className={`${classes.leftContent} ${!!openModel ? classes.hideMobileOpen : ""}`}
            >
              <span className={classes.searchWrap}>
                <SearchButton open={() => setOpenModel("search")} />
              </span>
              <CartButton
                isOpen={openModel === "cart"}
                open={() => setOpenModel("cart")}
                close={() => setOpenModel(null)}
              />
              <NotificationButton
                isOpen={openModel === "notification"}
                open={() => setOpenModel("notification")}
                close={() => setOpenModel(null)}
              />
              <LanguageSwitcher />
              <UserButton />
            </div>
            {!!openModel && (
              <div className={classes.mobileOpen}>
                <span className={`${classes.mobileLabel} ${txsRegular}`}>
                  {getContent(modalLabels[openModel])}
                </span>
                <button
                  onClick={() => setOpenModel(null)}
                  className={classes.mobileClose}
                >
                  <Ixon width="1rem">
                    <XMarkIcon />
                  </Ixon>
                </button>
                <Ixon width="1rem" className={classes.mobileIcon}>
                  {modalIcons[openModel]}
                </Ixon>
              </div>
            )}
          </div>
        </header>
        {openModel === "search" && (
          <SearchModal close={() => setOpenModel(null)} />
        )}
        <PublicMobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </div>
    </Fragment>
  );
};

export default PublicHeader;
