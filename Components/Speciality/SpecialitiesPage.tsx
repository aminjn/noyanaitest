"use client";

import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";

import classes from "./SpecialitiesPage.module.css";
import ListPageLayout from "../UI/ListPage/ListPageLayout";
import ListPageHeader from "../UI/ListPage/ListPageHeader";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { ContentKey } from "../Enums/contentKeys";
import useDebounce from "../Hooks/useDebounce";
import Ixon from "../UI/Ixon";
import SearchIcon from "../Icons/SearchIcon";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import useProgress from "../Hooks/useProgress";
import SmallAd from "../UI/ListPage/SmallAd";
import Link from "@/Components/i18n/Link";
import Pagination from "../UI/Pagination";
import SpecialityIcon from "../Icons/speciality/SpecialityIcon";

const NS: ContentNamespace[] = ["common", "specialitiesList"];

type SpecialityGroup = "medical" | "dental" | "allied";
const GROUPS: { key: SpecialityGroup; title: ContentKey }[] = [
  { key: "medical", title: "specGroupMedical" },
  { key: "dental", title: "specGroupDental" },
  { key: "allied", title: "specGroupAllied" },
];

export type SpecialitiesPageProps = {
  data: (ISpeciality & { doctorsCountWithSideSpeciality?: number; group?: SpecialityGroup })[];
  pagesCount: number;
};

// All specialities in one list (2026-09): no "speciality group" filter - a
// speciality is the only level, and each card opens its doctors.
const SpecialitiesPage = ({ data, pagesCount }: SpecialitiesPageProps) => {
  const getContent = useScopedLocale(NS);
  const groups = new Set((Array.isArray(data) ? data : []).map((n) => n?.group || "medical")).size;

  const searchParams = useSearchParams();
  const [query, setQuery] = useDebounce<string>({
    initialValue: searchParams.get("search") || "",
  });

  const push = useProgress();

  useEffect(() => {
    // only a changed search moves to page 1 of its results
    if ((searchParams.get("search") || "") === query) return;
    const params = new URLSearchParams();
    if (query) params.append("search", query);
    push(`/speciality?${params.toString()}`);
  }, [query, push, searchParams]);

  return (
    <ListPageLayout
      trail={[
        { title: getContent("homePage"), target: "/" },
        { title: getContent("specialities"), target: "/speciality" },
      ]}
    >
      <ListPageHeader
        title={getContent("specialitiesListTitle")}
        legend={getContent("specialitiesListLegend")}
      />
      <div className={classes.searchBox}>
        <input
          defaultValue={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={getContent("searchInSpecialities")}
          className={classes.searchInput}
        />
        <Ixon width="1.5rem" className={classes.searchIcon}>
          <SearchIcon />
        </Ixon>
      </div>
      {/* the directory (2026-10, like Doctolib / Zocdoc): small tiles - the
          field's icon, its name and how many doctors - each opening that
          speciality's doctors with every filter; no doctor sliders */}
      {GROUPS.map((group) => {
        const rows = (Array.isArray(data) ? data : []).filter(
          (n) => !!n?._id && !!n.name && (n.group || "medical") === group.key,
        );
        if (!rows.length) return null;
        return (
          <section key={group.key} className={classes.group}>
            {/* medicine, dentistry, the other health professions - as
                Paziresh24 groups them; one heading only when there are more */}
            {groups > 1 && <h2 className={classes.groupTitle}>{getContent(group.title)}</h2>}
            <ul className={classes.tiles}>
              {rows.map((node) => (
                <li key={node._id}>
                  <Link href={`/speciality/${node.slug || node._id}`} className={classes.tile}>
                    <span className={classes.tileIcon} aria-hidden>
                      <SpecialityIcon node={node} />
                    </span>
                    <span className={classes.tileText}>
                      <span className={classes.tileName}>{node.name}</span>
                      <span className={classes.tileCount}>
                        {getContent("nDoctors", [String(node.doctorsCountWithSideSpeciality || 0)])}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      {pagesCount > 1 && (
        <div className={classes.pagination}>
          <Pagination
            currentPage={Number(searchParams.get("page")) || 1}
            pagesCount={pagesCount}
            makePath={(page) => {
              const params = new URLSearchParams();
              params.append("page", page.toString());
              const search = searchParams.get("search");
              if (search) params.append("search", search);
              return `/speciality?${params.toString()}`;
            }}
          />
        </div>
      )}
      <SmallAd position="specialities1" />
    </ListPageLayout>
  );
};

export default SpecialitiesPage;
