import Link from "next/link";
import LogoLong from "../UI/LogoLong";
import classes from "./PublicHeader.module.css";
import UserButton from "./UserButton";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import Ixon from "../UI/Ixon";
import ChevronIcon from "../Icons/ChevronIcon";
import CallingIcon from "../Icons/CallingIcon";
import ChatBubbleIcon from "../Icons/ChatBubbleIcon";
import useLocale from "../Hooks/useLocale";
import { ContentKey } from "../Enums/contentKeys";
import SearchIcon from "../Icons/SearchIcon";
import Bell01Icon from "../Icons/Bell01Icon";
import SearchButton from "./SearchButton";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { IBlogCategory } from "../Admin/Blog/AdminManageBlogsPage";
import { IProductCategory } from "../Admin/ProductCategory/AdminManageProductCategoriesPage";
import { IDiseaseCategory } from "../Admin/DiseaseCategory/AdminManageDiseaseCategoriesPage";
import { IClinicCategory } from "../Admin/ClinicCategory/AdminManageClinicCategoriesPage";
import { IHospitalCategory } from "../Admin/HospitalCategory/AdminManageHospitalCategoriesPage";
import { ITestCategory } from "../Admin/TestCategory/AdminManageTestCategoriesPage";
import { IServiceCategory } from "../Admin/ServiceCategory/AdminManageServiceCategoriesPage";
import { ISpecialityCategory } from "../Admin/SpecialityCategory/AdminManageSpecialityCategoriesPage";
import { ISymptomCategory } from "../Admin/SymptomCategory/AdminManageSymptomCategoriesPage";
import { IInsuranceCategory } from "../Admin/InsuranceCategory/AdminManageInsuranceCategoriesPage";
import { t2xsRegular, txsMedium } from "../UI/Typography";

export interface HeaderCategories {
  blogCategories: IBlogCategory[];
  productCategories: IProductCategory[];
  diseaseCategories: IDiseaseCategory[];
  clinicCategories: IClinicCategory[];
  hospitalCategories: IHospitalCategory[];
  testCategories: ITestCategory[];
  serviceCategories: IServiceCategory[];
  specialityCategories: ISpecialityCategory[];
  symptomCategories: ISymptomCategory[];
  insuranceCategories: IInsuranceCategory[];
}

type CategoryLike = {
  _id: string;
  slug?: string;
  name?: string;
  title?: string;
};

const categoryTabs: {
  key: keyof HeaderCategories;
  label: ContentKey;
  allTarget: string;
  hrefFor: (value: string) => string;
}[] = [
  {
    key: "specialityCategories",
    label: "specialities",
    allTarget: "/speciality",
    hrefFor: (v) => `/speciality?category=${v}`,
  },
  {
    key: "diseaseCategories",
    label: "diseases",
    allTarget: "/disease",
    hrefFor: (v) => `/disease?category=${v}`,
  },
  {
    key: "symptomCategories",
    label: "symptoms",
    allTarget: "/symptom",
    hrefFor: () => "/symptom",
  },
  {
    key: "clinicCategories",
    label: "clinics",
    allTarget: "/clinic",
    hrefFor: (v) => `/clinic?category=${v}`,
  },
  {
    key: "hospitalCategories",
    label: "hospitals",
    allTarget: "/hospital",
    hrefFor: (v) => `/hospital?category=${v}`,
  },
  {
    key: "serviceCategories",
    label: "services",
    allTarget: "/service",
    hrefFor: (v) => `/service?category=${v}`,
  },
  {
    key: "productCategories",
    label: "products",
    allTarget: "/product",
    hrefFor: (v) => `/product?category=${v}`,
  },
  {
    key: "insuranceCategories",
    label: "insurances",
    allTarget: "/insurance",
    hrefFor: (v) => `/insurance?category=${v}`,
  },
  {
    key: "testCategories",
    label: "tests",
    allTarget: "/test",
    hrefFor: () => "/test",
  },
  {
    key: "blogCategories",
    label: "blogs",
    allTarget: "/mag",
    hrefFor: (v) => `/mag/category/${v}`,
  },
];

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
  const getContent = useLocale();

  return (
    <Link
      href={target}
      className={`${classes.link} ${
        pathname === target ? classes.active : ""
      } ${accent ? classes.accent : ""}`}
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

  const getContent = useLocale();

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

  const getContent = useLocale();

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

const PublicHeader = () => {
  return (
    <div className={classes.container}>
      <header className={classes.main}>
        <Link className={classes.right} href={"/"}>
          <LogoLong />
        </Link>
        <nav className={classes.nav}>
          <NavLink title="homePage" target="/" />
          <Categories />
          <NavLink title="officeBook" target="/book" />
          <NavLink title="aiDetection" target="/wizard" />
          <NavLink title="noyanClinic" target="/clinic" />
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
          <NavLink title="forDoctors" target="/doctorpanel" accent />
        </nav>
        <div className={classes.left}>
          <SearchButton />
          <button type="button">
            <Ixon width="1.5rem">
              <Bell01Icon />
            </Ixon>
          </button>
          <UserButton />
        </div>
      </header>
    </div>
  );
};

export default PublicHeader;
