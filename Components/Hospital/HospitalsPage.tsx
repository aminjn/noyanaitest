"use client";
import Image from "next/image";
import { IHospital } from "../Admin/Hospital/AdminManageHospitalsPage";
import { IHospitalCategory } from "../Admin/HospitalCategory/AdminManageHospitalCategoriesPage";
import { IProvince } from "../Admin/Province/AdminManageProvincesPage";
import SpecialsBox from "../Clinic/SpecialsBox";
import useLocale from "../Hooks/useLocale";
import Calendar02Icon from "../Icons/Calendar02Icon";
import ListPageHeader from "../UI/ListPage/ListPageHeader";
import ListPageLayout from "../UI/ListPage/ListPageLayout";
import classes from "./HospitalsPage.module.css";
import { FilePath } from "../config";
import { tsmBold, tsmRegular, txsMedium } from "../UI/Typography";
import Ixon from "../UI/Ixon";
import LocationIcon from "../Icons/LocationIcon";
import StarIcon from "../Icons/StarIcon";
import BigAd from "../UI/ListPage/BigAd";
import { useEffect, useState } from "react";
import useDebounce from "../Hooks/useDebounce";
import { useSearchParams } from "next/navigation";
import useProgress from "../Hooks/useProgress";
import SearchIcon from "../Icons/SearchIcon";
import ListPageList from "../UI/ListPage/ListPageList";
import HospitalCard from "./HospitalCard";
import SmallAd from "../UI/ListPage/SmallAd";

export type HospitalsPageProps = {
  data: IHospital<{
    Province: Record<never, never>;
    Tags: Record<never, never>;
    Category: Record<never, never>;
  }>[];
  categories: IHospitalCategory[];
  provinces: IProvince[];
  pagesCount: number;
  specials: IHospital<{ Province: Record<never, never> }>[];
};

const SpecialItem = ({
  node,
}: {
  node: IHospital<{ Province: Record<never, never> }>;
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
        <span className={txsMedium}>4.9</span>
        <Ixon width="1rem">
          <StarIcon />
        </Ixon>
      </div>
    </div>
  );
};

const HospitalsPage = ({
  categories,
  data,
  provinces,
  specials,
  pagesCount,
}: HospitalsPageProps) => {
  const getContent = useLocale();

  const [query, setQuery] = useDebounce<string>({ initialValue: "" });

  const searchParams = useSearchParams();

  const push = useProgress();

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.append("search", query);
    const category = searchParams.get("category");
    if (category) params.append("category", category);
    const province = searchParams.get("province");
    if (province) params.append("province", province);
    push(`/hospital?${params.toString()}`);
  }, [push, query, searchParams]);

  return (
    <ListPageLayout>
      <ListPageHeader
        title={getContent("hospitalsListTitle")}
        legend={getContent("hospitalsListLegend")}
      />
      {!!specials.length && (
        <SpecialsBox
          icon={<Calendar02Icon />}
          title={getContent("specialNoyanHospitals")}
          badge={getContent("specialNoyanHospitalBadge")}
          description={getContent("specialNoyanHospitalLegend")}
          button={getContent("noyanHospitalSepcialButton")}
        >
          {specials.map((node) => (
            <SpecialItem key={node._id} node={node} />
          ))}
        </SpecialsBox>
      )}
      <BigAd />
      <div className={classes.searchBox}>
        <div className={classes.inputBox}>
          <input
            placeholder={getContent("searchInHospitals")}
            onChange={(e) => setQuery(e.target.value)}
            className={`${classes.input} ${tsmRegular}`}
          />
          <Ixon width="1.5rem" className={classes.searchIcon}>
            <SearchIcon />
          </Ixon>
        </div>
        <select
          className={`${classes.select} ${tsmRegular}`}
          onChange={(e) => {
            const params = new URLSearchParams();
            const target = provinces.find(
              (el) => (el.slug || el._id) === e.target.value,
            );
            if (target) params.append("province", target.slug || target._id);
            if (query) params.append("search", query);
            const category = searchParams.get("category");
            if (category) params.append("category", category);
            push(`/hospital?${params.toString()}`);
          }}
        >
          <option value={"__all__"}>{getContent("province")}</option>
          {provinces.map((province) => (
            <option key={province._id} value={province.slug || province._id}>
              {province.name}
            </option>
          ))}
        </select>
        <select
          className={classes.select}
          onChange={(e) => {
            const params = new URLSearchParams();
            const target = categories.find(
              (el) => (el.slug || el._id) === e.target.value,
            );
            if (target) params.append("category", target.slug || target._id);
            const province = searchParams.get("province");
            if (province) params.append("province", province);
            if (query) params.append("search", query);
            push(`/hospital?${params.toString()}`);
          }}
        >
          <option value="__all__">{getContent("category")}</option>
          {categories.map((category) => (
            <option key={category._id} value={category.slug || category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <ListPageList
        itemWidth="22.8125rem"
        pagination={{
          currentPage: Number(searchParams.get("page")) || 1,
          makePath: (page) => {
            const params = new URLSearchParams();
            params.append("page", page.toString());
            const query = searchParams.get("search");
            if (query) params.append("search", query);
            const category = searchParams.get("category");
            if (category) params.append("category", category);
            const province = searchParams.get("province");
            if (province) params.append("province", province);
            return `/hospital?${params.toString()}`;
          },
          pagesCount: pagesCount,
        }}
      >
        {data.map((node) => (
          <HospitalCard key={node._id} node={node} />
        ))}
      </ListPageList>
      <SmallAd />
    </ListPageLayout>
  );
};

export default HospitalsPage;
