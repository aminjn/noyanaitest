import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import classes from "./MapPage.module.css";
import useSWR from "swr";
import {
  ICity,
  IDistrict,
  IPolygon,
  IProvince,
} from "../Admin/Province/AdminManageProvincesPage";
import { fetcher } from "../helpers/fetcher";
import { API } from "../config";
import Ixon from "../UI/Ixon";
import SearchIcon from "../Icons/SearchIcon";
import { tsmRegular } from "../UI/Typography";
import useLocale from "../Hooks/useLocale";
import { isSea } from "node:sea";

export type ZoneData = {
  provinces: IProvince[];
  cities: ICity[];
  districts: IDistrict[];
};

const SearchZones = ({
  onSelect,
}: {
  onSelect: (geometry: IPolygon) => unknown;
}) => {
  const [query, setQuery] = useState<string>("");

  const { data: zoneData } = useSWR<ZoneData>(
    query.trim().length > 3 ? `${API}/public/searchZones?query=${query}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
    { keepPreviousData: true },
  );

  const getContent = useLocale();

  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  const searchBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (
        !searchBoxRef.current ||
        !e.target ||
        !searchBoxRef.current.contains(e.target as Node)
      )
        return setIsSearchOpen(false);
    };
    window.addEventListener("click", listener, false);
    return () => window.removeEventListener("click", listener, false);
  }, []);

  const isEmpty = useMemo<boolean>(() => {
    if (!zoneData) return false;
    return (
      !zoneData.cities.length &&
      !zoneData.districts.length &&
      !zoneData.provinces.length
    );
  }, [zoneData]);

  const isOpen = useMemo<boolean>(
    () => !!zoneData && isSearchOpen,
    [zoneData, isSearchOpen],
  );

  return (
    <div
      className={classes.searchBox}
      onClick={() => setIsSearchOpen(true)}
      ref={searchBoxRef}
    >
      <div className={classes.inputBox}>
        <Ixon className={classes.searchIcon} width="1.5rem">
          <SearchIcon />
        </Ixon>
        <input
          className={`${classes.searchInput} ${tsmRegular} ${isOpen ? classes.openSearch : ""}`}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={getContent("searchProvinceOrCityOrDistrict")}
        />
      </div>
      {isOpen && (
        <div className={classes.searchResults}>
          {isEmpty ? (
            <p>{getContent("nothingWasFound")}</p>
          ) : (
            <Fragment>
              {[
                ...zoneData!.provinces,
                ...zoneData!.cities,
                ...zoneData!.districts,
              ].map((zone) => (
                <Fragment key={zone._id}>
                  {!!zone.geometry && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.nativeEvent.stopPropagation();
                        e.nativeEvent.stopImmediatePropagation();
                        if (!zone.geometry) return;
                        onSelect(zone.geometry);
                        setIsSearchOpen(false);
                      }}
                    >
                      {zone.name}
                    </button>
                  )}
                </Fragment>
              ))}
            </Fragment>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchZones;
