"use client";

import { ReactNode, useEffect, useRef } from "react";
import useSWR from "swr";
import { SwiperSlide } from "swiper/react";
import classes from "./SearchModal.module.css";
import Ixon from "../UI/Ixon";
import SearchIcon from "../Icons/SearchIcon";
import ChevronIcon from "../Icons/ChevronIcon";
import Button from "../UI/Button";
import SwiperSlider from "../UI/SwiperSlider";
import useDebounce from "../Hooks/useDebounce";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { IBlog } from "../Admin/Blog/AdminManageBlogsPage";
import { IProduct } from "../Admin/Product/AdminManageProductsPage";
import { IProductPackage } from "../Admin/ProductPackage/AdminManageProductPackagesPage";
import {
  IDisease,
  ISymptom,
  IDrug,
} from "../Admin/Disease/AdminManageDiseasesPage";
import { IClinic } from "../Admin/Clinic/AdminManageClinicsPage";
import { IParaClinic } from "./ParaClinicPanelLayout";
import { IHospital } from "../Admin/Hospital/AdminManageHospitalsPage";
import { ITest } from "../Admin/Test/AdminManageTestsPage";
import { IService } from "../Admin/Service/AdminManageServicesPage";
import { IServicePackage } from "../Admin/ServicePackage/AdminManageServicePackagesPage";
import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import { InsurancesPageNode } from "../Insurance/InsurancesPage";
import BlogMainCard from "../Blog/BlogMainCard";
import ProductCard from "../Product/ProductCard";
import DiseaseCard from "../Disease/DiseaseCard";
import ClinicCard from "../Clinic/ClinicCard";
import ParaClinicCard from "../ParaClinic/ParaClinicCard";
import HospitalCard from "../Hospital/HospitalCard";
import TestCard from "../Test/TestCard";
import ServiceCard from "../Service/ServiceCard";
import SpecialityCard from "../Speciality/SpecialityCard";
import SymptomCard from "../Symptom/SymptomCard";
import InsuranceCard from "../Insurance/InsuranceCard";
import DoctorCardAlt from "../UI/DoctorCardAlt";
import DrugCard from "../Drug/DrugCard";
import { tbaseMedium, tsmDemiBold } from "../UI/Typography";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common"];

type ProductNode =
  | (IProduct<{
      Sellers: { Seller: Record<never, never> };
      Category: Record<never, never>;
    }> & { model: "Product" })
  | (IProductPackage<{
      Owner: Record<never, never>;
      Products: Record<never, never>;
      Category: Record<never, never>;
    }> & { model: "ProductPackage" });

type ServiceNode =
  | (IService<{
      Category: Record<never, never>;
      Owner: { Province: Record<never, never> };
    }> & { model: "Service" })
  | (IServicePackage<{
      Category: Record<never, never>;
      Owner: { Province: Record<never, never> };
      Services: Record<never, never>;
    }> & { model: "ServicePackage" });

type GlobalSearchData = {
  blogs: IBlog[];
  products: ProductNode[];
  productPackages: ProductNode[];
  diseases: IDisease<{
    Tag: Record<never, never>;
    Category: Record<never, never>;
  }>[];
  clinics: IClinic<{
    Province: Record<never, never>;
    Category: Record<never, never>;
    Tags: Record<never, never>;
  }>[];
  paraClinics: IParaClinic<{
    Tags: Record<never, never>;
    Province: Record<never, never>;
  }>[];
  hospitals: IHospital<{
    Province: Record<never, never>;
    Tags: Record<never, never>;
    Category: Record<never, never>;
  }>[];
  tests: ITest<{ Category: Record<never, never> }>[];
  services: ServiceNode[];
  servicePackages: ServiceNode[];
  specialities: ISpeciality<{ Doctors: { Province: Record<never, never> } }>[];
  symptoms: ISymptom[];
  insurances: InsurancesPageNode[];
  pharmacies?: IParaClinic<{
    Tags: Record<never, never>;
    Province: Record<never, never>;
  }>[];
  doctorProfiles: IDoctorProfile<{
    MainSpecialityPopulated: Record<never, never>;
    TextChatSettings: Record<never, never>;
    SipCallSettings: Record<never, never>;
    InPersonSettings: Record<never, never>;
    VideoCallSettings: Record<never, never>;
    VoiceCallSettings: Record<never, never>;
    Province: Record<never, never>;
  }>[];
  drugs: IDrug<{ Tag: Record<never, never> }>[];
};

const ResultSection = <T extends { _id: string }>({
  title,
  nodes,
  width,
  render,
  all,
  query,
  onNavigate,
}: {
  title: string;
  nodes: T[];
  width: string;
  render: (node: T) => ReactNode;
  all?: string;
  query?: string;
  onNavigate?: () => void;
}) => {
  const getContent = useScopedLocale(LOCALE_NS);

  if (!nodes.length) return null;
  return (
    <div className={classes.section}>
      <div className={classes.sectionHeader}>
        <h3 className={`${classes.sectionTitle} ${tbaseMedium}`}>{title}</h3>
        {!!all && (
          <Button
            variant="Primary"
            mode="Inline"
            size="S"
            onClick={onNavigate}
            tailIcon={
              <span style={{ transform: "rotateZ(90deg)" }}>
                <ChevronIcon />
              </span>
            }
            href={query ? `${all}?search=${encodeURIComponent(query)}` : all}
          >
            {getContent("seeAll")}
          </Button>
        )}
      </div>
      <SwiperSlider>
        {nodes.map((node) => (
          <SwiperSlide
            tag="li"
            key={node._id}
            className={classes.slide}
            style={{ width }}
          >
            {render(node)}
          </SwiperSlide>
        ))}
      </SwiperSlider>
    </div>
  );
};

const SearchModal = ({ close }: { close: () => unknown }) => {
  const getContent = useScopedLocale(LOCALE_NS);

  const [query, setQuery] = useDebounce<string>({ initialValue: "" });

  const trimmed = query.trim();

  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useSWR<GlobalSearchData>(
    trimmed
      ? `${API}/public/search/global?query=${encodeURIComponent(trimmed)}`
      : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
    { keepPreviousData: true },
  );

  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (
        !containerRef.current ||
        !e.target ||
        !containerRef.current.contains(e.target as Node)
      ) {
        return close();
      }
    };
    setTimeout(() => {
      window.addEventListener("click", listener, false);
    }, 10);
    return () => window.removeEventListener("click", listener, false);
  }, [close]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  const products = [
    ...(data?.products || []),
    ...(data?.productPackages || []),
  ];
  const services = [
    ...(data?.services || []),
    ...(data?.servicePackages || []),
  ];

  const hasAnyResult =
    !!data &&
    !!(
      data.blogs.length ||
      products.length ||
      data.diseases.length ||
      data.clinics.length ||
      data.paraClinics.length ||
      data.hospitals.length ||
      data.tests.length ||
      services.length ||
      data.specialities.length ||
      data.symptoms.length ||
      data.insurances.length ||
      !!data.pharmacies?.length ||
      data.doctorProfiles.length ||
      data.drugs.length
    );

  return (
    <div className={classes.main} ref={containerRef}>
      <div className={classes.blur} onClick={() => close()} />
      <div className={classes.content}>
        <div className={classes.searchBox}>
          <input
            autoFocus
            placeholder={getContent("searchPlaceholder")}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Ixon className={classes.icon} width="1.25rem">
            <SearchIcon />
          </Ixon>
        </div>
        {!!trimmed && (
          <div className={classes.results}>
            {isLoading && !data && (
              <div className={classes.state}>{getContent("loading")}</div>
            )}
            {!!data && !hasAnyResult && (
              <div className={classes.state}>{getContent("noResultFound")}</div>
            )}
            {!!data && (
              <>
                <ResultSection
                  title={getContent("doctors")}
                  nodes={data.doctorProfiles}
                  width="14.75rem"
                  render={(node) => <DoctorCardAlt node={node} />}
                  all="/book"
                  onNavigate={close}
                />
                <ResultSection
                  title={getContent("blog")}
                  nodes={data.blogs}
                  width="24rem"
                  render={(node) => <BlogMainCard node={node} />}
                  all="/mag"
                  query={trimmed}
                  onNavigate={close}
                />
                <ResultSection
                  title={getContent("products")}
                  nodes={products}
                  width="16.5rem"
                  render={(node) => <ProductCard node={node} />}
                  all="/product"
                  query={trimmed}
                  onNavigate={close}
                />
                <ResultSection
                  title={getContent("services")}
                  nodes={services}
                  width="16.5rem"
                  render={(node) => <ServiceCard node={node} />}
                  all="/service"
                  query={trimmed}
                  onNavigate={close}
                />
                <ResultSection
                  title={getContent("clinics")}
                  nodes={data.clinics}
                  width="24.0625rem"
                  render={(node) => <ClinicCard node={node} />}
                  all="/clinic"
                  query={trimmed}
                  onNavigate={close}
                />
                <ResultSection
                  title={getContent("paraClinics")}
                  nodes={data.paraClinics}
                  width="24.0625rem"
                  render={(node) => <ParaClinicCard node={node} />}
                  all="/paraClinic"
                  query={trimmed}
                  onNavigate={close}
                />
                <ResultSection
                  title={getContent("pharmacies")}
                  nodes={data.pharmacies || []}
                  width="24.0625rem"
                  render={(node) => (
                    <ParaClinicCard node={node} kind="pharmacy" />
                  )}
                  all="/pharmacy"
                  query={trimmed}
                  onNavigate={close}
                />
                <ResultSection
                  title={getContent("hospitals")}
                  nodes={data.hospitals}
                  width="22.8125rem"
                  render={(node) => <HospitalCard node={node} />}
                  all="/hospital"
                  query={trimmed}
                  onNavigate={close}
                />
                <ResultSection
                  title={getContent("specialities")}
                  nodes={data.specialities}
                  width="22.8125rem"
                  render={(node) => <SpecialityCard node={node} />}
                  all="/speciality"
                  query={trimmed}
                  onNavigate={close}
                />
                <ResultSection
                  title={getContent("diseases")}
                  nodes={data.diseases}
                  width="22.8125rem"
                  render={(node) => <DiseaseCard node={node} />}
                  all="/disease"
                  query={trimmed}
                  onNavigate={close}
                />
                <ResultSection
                  title={getContent("symptoms")}
                  nodes={data.symptoms}
                  width="16.875rem"
                  render={(node) => <SymptomCard node={node} />}
                  all="/symptom"
                  query={trimmed}
                  onNavigate={close}
                />
                <ResultSection
                  title={getContent("drug")}
                  nodes={data.drugs}
                  width="22.8125rem"
                  render={(node) => <DrugCard node={node} />}
                  all="/drug"
                  query={trimmed}
                  onNavigate={close}
                />
                <ResultSection
                  title={getContent("tests")}
                  nodes={data.tests}
                  width="24rem"
                  render={(node) => <TestCard node={node} />}
                  all="/test"
                  query={trimmed}
                  onNavigate={close}
                />
                <ResultSection
                  title={getContent("insurances")}
                  nodes={data.insurances}
                  width="22.8125rem"
                  render={(node) => <InsuranceCard node={node} />}
                  all="/insurance"
                  query={trimmed}
                  onNavigate={close}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;
