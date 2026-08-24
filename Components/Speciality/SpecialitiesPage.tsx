"use client";

import "swiper/css";

import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";

import classes from "./SpecialitiesPage.module.css";
import SpecialityCard from "./SpecialityCard";
import { ListPage } from "../Disease/DiseasesListPage";
import ListPageLayout from "../UI/ListPage/ListPageLayout";
import ListPageHeader from "../UI/ListPage/ListPageHeader";
import useLocale from "../Hooks/useLocale";
import Input from "../UI/Input";
import useDebounce from "../Hooks/useDebounce";
import Ixon from "../UI/Ixon";
import SearchIcon from "../Icons/SearchIcon";
import Button from "../UI/Button";
import FilterIcon from "../Icons/FilterIcon";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import PopupCard from "../UI/PopupCard";
import { ISpecialityCategory } from "../Admin/SpecialityCategory/AdminManageSpecialityCategoriesPage";
import useProgress from "../Hooks/useProgress";
import XMarkIcon from "../Icons/XMarkIcon";
import ListPageList from "../UI/ListPage/ListPageList";
import SmallAd from "../UI/ListPage/SmallAd";
import usePopup from "../Hooks/usePopup";

export type SpecialitiesPageProps = {
  data: ISpeciality<{ Doctors: { Province: Record<never, never> } }>[];
  pagesCount: number;
  categories: ISpecialityCategory[];
};

const CategorySelectorPopup = ({
  categories,
  selected,
}: {
  categories: ISpecialityCategory[];
  selected: ISpecialityCategory[];
}) => {
  const push = useProgress();

  const { closePopup } = usePopup();

  return (
    <PopupCard>
      <div className={classes.popup}>
        {categories.map((cat) => (
          <Button
            key={cat._id}
            onClick={() => {
              const clone = [...selected];
              const index = clone.findIndex((el) => el._id === cat._id);
              if (index > -1) {
                clone.splice(index, 1);
              } else {
                clone.push(cat);
              }
              const params = new URLSearchParams();
              for (const c of clone) params.append("category", c.slug || c._id);
              push(`/speciality?${params.toString()}`);
              closePopup();
            }}
            variant={
              selected.some((el) => el._id === cat._id) ? "Primary" : "Neutral"
            }
          >
            {cat.name}
          </Button>
        ))}
      </div>
    </PopupCard>
  );
};

const SpecialitiesPage = ({
  data,
  pagesCount,
  categories,
}: SpecialitiesPageProps) => {
  const getContent = useLocale();

  const [query, setQuery] = useDebounce<string>({ initialValue: "" });

  const searchParams = useSearchParams();

  const getSelectedCategories = useCallback(() => {
    const query = searchParams.getAll("category");
    return categories.filter(
      (cat) =>
        query.includes(cat._id) || (cat.slug && query.includes(cat.slug)),
    );
  }, [searchParams, categories]);
  const [selectedCategories, setSelectedCategories] = useState<
    ISpecialityCategory[]
  >(getSelectedCategories);

  const push = useProgress();

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.append("search", query);
    for (const category of selectedCategories)
      params.append("category", category.slug || category._id);
    const page = searchParams.get("page");
    if (page) params.append("page", page);
    push(`/speciality?${params.toString()}`);
  }, [query, selectedCategories, push, searchParams]);

  const { setPopup } = usePopup();

  useEffect(() => {
    setSelectedCategories(getSelectedCategories);
  }, [getSelectedCategories, searchParams]);

  return (
    <ListPageLayout
      trail={[
        { title: "صفحه اصلی", target: "/" },
        { title: "تخصص ها", target: "/speciality" },
      ]}
    >
      <ListPageHeader
        title={getContent("specialitiesListTitle")}
        legend={getContent("specialitiesListLegend")}
      />
      <div className={classes.searchBox}>
        <input
          onChange={(e) => setQuery(e.target.value)}
          placeholder={getContent("searchInSpecialities")}
          className={classes.searchInput}
        />
        <Ixon width="1.5rem" className={classes.searchIcon}>
          <SearchIcon />
        </Ixon>
        <button
          className={classes.categoryButton}
          onClick={() =>
            setPopup(
              "CategorySelector",
              <CategorySelectorPopup
                selected={selectedCategories}
                categories={categories}
              />,
            )
          }
        >
          <span>{getContent("category")}</span>
          <Ixon width="1rem">
            <FilterIcon />
          </Ixon>
        </button>
      </div>
      {!!selectedCategories.length && (
        <div className={classes.selectedBox}>
          <div className={classes.selectedCategories}>
            {selectedCategories.map((cat) => (
              <Button
                key={cat._id}
                variant="Info"
                mode="Fill"
                size="M"
                radius="High"
                tailIcon={<XMarkIcon />}
                onClick={() => {
                  const clone = [...selectedCategories];
                  const index = clone.findIndex((el) => el._id === cat._id);
                  if (index < 0) return;
                  clone.splice(index, 1);
                  const params = new URLSearchParams();
                  for (const category of clone)
                    params.append("category", category.slug || category._id);
                  push(`/speciality`);
                }}
              >
                {cat.name}
              </Button>
            ))}
          </div>
          <Button
            variant="Error"
            size="M"
            mode="Fill"
            radius="High"
            onClick={() => {
              const params = new URLSearchParams();
              if (query) params.append("search", query);
              push(`/speciality?${params.toString()}`);
            }}
          >
            {getContent("deleteAll")}
          </Button>
        </div>
      )}
      <ListPageList
        itemWidth="22.8125rem"
        pagination={{
          currentPage: Number(searchParams.get("page")) || 1,
          makePath: (page) => {
            const params = new URLSearchParams();
            params.append("page", page.toString());
            const query = searchParams.get("search");
            if (query) params.append("search", query);
            for (const cat of selectedCategories)
              params.append("category", cat.slug || cat._id);
            return `/speciality?${params.toString()}`;
          },
          pagesCount: pagesCount,
        }}
      >
        {data.map((node) => (
          <SpecialityCard key={node._id} node={node} />
        ))}
      </ListPageList>
      <SmallAd position="specialities1" />
    </ListPageLayout>
  );
};

export default SpecialitiesPage;
