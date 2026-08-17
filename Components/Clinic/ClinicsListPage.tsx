"use client";

import classes from "./ClinicsListPage.module.css";
import { IClinic } from "../Admin/Clinic/AdminManageClinicsPage";
import { IClinicCategory } from "../Admin/ClinicCategory/AdminManageClinicCategoriesPage";
import useLocale from "../Hooks/useLocale";
import BigAd from "../UI/ListPage/BigAd";
import ListPageHeader from "../UI/ListPage/ListPageHeader";
import ListPageIntro from "../UI/ListPage/ListPageIntro";
import ListPageLayout from "../UI/ListPage/ListPageLayout";
import Ixon from "../UI/Ixon";
import Calendar02Icon from "../Icons/Calendar02Icon";
import Badge from "../UI/Badge";
import Button from "../UI/Button";
import CrownIcon from "../Icons/CrownIcon";
import Image from "next/image";
import { FilePath } from "../config";
import LocationIcon from "../Icons/LocationIcon";
import StarIcon from "../Icons/StarIcon";
import ListPageSearch from "../UI/ListPage/ListPageSearch";
import useDebounce from "../Hooks/useDebounce";
import ListPageCategorySelector from "../UI/ListPage/ListPageCategorySelector";
import ListPageList from "../UI/ListPage/ListPageList";
import ClinicCard from "./ClinicCard";
import { useSearchParams } from "next/navigation";
import SmallAd from "../UI/ListPage/SmallAd";
import { useEffect } from "react";
import useProgress from "../Hooks/useProgress";
import SpecialsBox from "./SpecialsBox";
import { tsmBold, txsMedium } from "../UI/Typography";

export type ClinicsListProps = {
  data: IClinic<{
    Province: Record<never, never>;
    Category: Record<never, never>;
    Tags: Record<never, never>;
  }>[];
  pagesCount: number;
  categories: IClinicCategory[];
  specials: IClinic<{ Province: Record<never, never> }>[];
};

const SpecialItem = ({
  node,
}: {
  node: IClinic<{ Province: Record<never, never> }>;
}) => {
  return (
    <div className={classes.item}>
      <div className={classes.itemImage}>
        <Image
          alt={node.name || ""}
          src={`${FilePath}/${node.image}`}
          fill
          sizes="4rem"
          style={{ objectFit: "contain" }}
        />
      </div>
      <div className={classes.itemDetails}>
        <span className={`${classes.itemName} ${tsmBold}`}>{node.name}</span>
        {!!node.province && (
          <div className={classes.provinceBox}>
            <Ixon width=".75rem">
              <LocationIcon />
            </Ixon>
            <span>{node.province.name}</span>
          </div>
        )}
      </div>
      <div className={classes.itemScore}>
        <span className={txsMedium}>{node.averageScore.toFixed(1)}</span>
        <Ixon width="1rem">
          <StarIcon />
        </Ixon>
      </div>
    </div>
  );
};

const ClinicsListPage = ({
  categories,
  data,
  pagesCount,
  specials,
}: ClinicsListProps) => {
  const getContent = useLocale();

  const [query, setQuery] = useDebounce({ initialValue: "" });

  const searchParams = useSearchParams();

  const push = useProgress();

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.append("search", query);
    const categories = searchParams.getAll("category");
    for (const cat of categories) params.append("category", cat);
    push(`/clinic?${params.toString()}`);
  }, [searchParams, query, push]);

  return (
    <ListPageLayout
      trail={[
        { title: "صفحه اصلی", target: "/" },
        { title: "کلینیک ها", target: "/clinic" },
      ]}
    >
      <ListPageHeader
        title={getContent("clinicsListTitle")}
        legend={getContent("clinicsListLegend")}
      />
      <ListPageIntro
        title={getContent("clinicsListIntroTitle")}
        description={getContent("clinicsListIntroDescription")}
      />
      {!!specials.length && (
        <SpecialsBox
          icon={<Calendar02Icon />}
          title={getContent("specialNoyanClinics")}
          badge={getContent("specialNoyanClinicBadge")}
          description={getContent("specialNoyanClinicLegend")}
          button={getContent("noyanClinicSepcialButton")}
        >
          {specials.map((el) => (
            <SpecialItem key={el._id} node={el} />
          ))}
        </SpecialsBox>
      )}
      <BigAd position="clinics1" />
      <ListPageSearch
        onChange={(e) => setQuery(e.target.value)}
        placeholder={getContent("searchInClinics")}
      />
      <ListPageCategorySelector
        basePath="/clinic"
        categories={categories}
        title={getContent("clinicKind")}
      />
      <ListPageList
        itemWidth="24.0625rem"
        pagination={{
          currentPage: Number(searchParams.get("page")) || 1,
          makePath: (page) => {
            const params = new URLSearchParams();
            params.append("page", page.toString());
            const query = searchParams.get("search");
            if (query) params.append("search", query);
            const categories = searchParams.getAll("category");
            for (const cat of categories) params.append("category", cat);
            return `/clinic?${params.toString()}`;
          },
          pagesCount: pagesCount,
        }}
      >
        {data.map((node) => (
          <ClinicCard key={node._id} node={node} />
        ))}
      </ListPageList>
      <SmallAd position="clinics2" />
    </ListPageLayout>
  );
};

export default ClinicsListPage;
