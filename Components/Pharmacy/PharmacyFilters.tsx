"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "@/Components/i18n/Link";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import Ixon from "../UI/Ixon";
import FilterIcon from "../Icons/FilterIcon";
import SearchIcon from "../Icons/SearchIcon";
import { useIntlLocale } from "../i18n/navigation";
import { tsmDemiBold, txsMedium, txsRegular } from "../UI/Typography";
import classes from "./PharmacyFilters.module.css";

const NS: ContentNamespace[] = ["common", "pharmaciesList", "openingHours"];

type Named = { _id: string; name?: string };
type Change = Partial<Record<"city" | "insurance" | "roundTheClock" | "openNow" | "page", string | null>>;

// The pharmacy list's filters (2026-10 redesign, the owner's review: "the
// filters are awful" - a scrolling row of hundreds of city chips). As Snapp
// Pharmacy, Tapsi Dr and Digikala's pharmacy filter: one frosted panel
// beside the results (a fold-out on a phone) with the switches that matter
// first - open now, 24 hours - then the city as a searchable list and the
// insurer that pays the prescription. Every option is a link, so each view
// stays a crawlable URL.
const PharmacyFilters = ({
  cities,
  insurances,
  current,
  build,
  showRoundTheClock,
  showOpenNow,
}: {
  cities: Named[];
  insurances: Named[];
  current: { city?: string | null; insurance?: string | null; roundTheClock: boolean; openNow: boolean };
  build: (change: Change) => string;
  showRoundTheClock: boolean;
  showOpenNow: boolean;
}) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const [cityQuery, setCityQuery] = useState("");
  // open beside the list on a wide screen, folded on a phone
  const [open, setOpen] = useState(true);
  useEffect(() => {
    if (window.matchMedia("(max-width: 1000px)").matches) setOpen(false);
  }, []);
  const active = [current.city, current.insurance, current.roundTheClock, current.openNow].filter(Boolean).length;

  const shownCities = useMemo(() => {
    const q = cityQuery.trim();
    const list = q ? cities.filter((c) => (c.name || "").includes(q)) : cities;
    // the chosen city stays in view
    const chosen = cities.find((c) => c._id === current.city);
    return chosen && !list.includes(chosen) ? [chosen, ...list] : list;
  }, [cities, cityQuery, current.city]);

  const toggle = (on: boolean, label: string, href: string, dot?: boolean) => (
    <Link href={href} className={`${classes.switch} ${on ? classes.switchOn : ""} ${txsMedium}`} aria-pressed={on}>
      {dot && <span className={`${classes.dot} ${on ? classes.dotOn : ""}`} aria-hidden />}
      <span>{label}</span>
      <span className={classes.track} aria-hidden>
        <span className={classes.knob} />
      </span>
    </Link>
  );

  const panel = (
    <div className={classes.panel}>
      {(showOpenNow || showRoundTheClock) && (
        <div className={classes.group}>
          {showOpenNow &&
            toggle(current.openNow, getContent("ohOpenNowFilter"), build({ openNow: current.openNow ? null : "1", page: null }), true)}
          {showRoundTheClock &&
            toggle(
              current.roundTheClock,
              getContent("roundTheClock"),
              build({ roundTheClock: current.roundTheClock ? null : "1", page: null }),
            )}
        </div>
      )}
      {cities.length > 1 && (
        <div className={classes.group}>
          <span className={`${classes.groupTitle} ${tsmDemiBold}`}>{getContent("city")}</span>
          {cities.length > 8 && (
            <label className={classes.search}>
              <Ixon width="1rem">
                <SearchIcon />
              </Ixon>
              <input
                className={txsRegular}
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                placeholder={getContent("phSearchCity")}
                aria-label={getContent("phSearchCity")}
              />
            </label>
          )}
          <ul className={classes.options}>
            <li>
              <Link href={build({ city: null, page: null })} className={`${classes.option} ${!current.city ? classes.optionOn : ""} ${txsMedium}`}>
                {getContent("phAllCities")}
              </Link>
            </li>
            {shownCities.map((c) => (
              <li key={c._id}>
                <Link
                  href={build({ city: c._id, page: null })}
                  className={`${classes.option} ${current.city === c._id ? classes.optionOn : ""} ${txsMedium}`}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {!!insurances.length && (
        <div className={classes.group}>
          <span className={`${classes.groupTitle} ${tsmDemiBold}`}>{getContent("insurance")}</span>
          <div className={classes.pills}>
            <Link
              href={build({ insurance: null, page: null })}
              className={`${classes.pill} ${!current.insurance ? classes.pillOn : ""} ${txsMedium}`}
            >
              {getContent("phAllInsurances")}
            </Link>
            {insurances.map((c) => (
              <Link
                key={c._id}
                href={build({ insurance: c._id, page: null })}
                className={`${classes.pill} ${current.insurance === c._id ? classes.pillOn : ""} ${txsMedium}`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}
      {active > 0 && (
        <Link
          href={build({ city: null, insurance: null, roundTheClock: null, openNow: null, page: null })}
          className={`${classes.clear} ${txsMedium}`}
        >
          {getContent("phClearFilters")}
        </Link>
      )}
    </div>
  );

  return (
    <aside className={classes.main}>
      {/* desktop: always open beside the list; phone: a fold-out */}
      <details
        className={classes.fold}
        open={open}
        onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
      >
        <summary className={`${classes.summary} ${tsmDemiBold}`}>
          <Ixon width="1.1rem">
            <FilterIcon />
          </Ixon>
          <span>{getContent("filters")}</span>
          {active > 0 && <span className={classes.count}>{new Intl.NumberFormat(intlTag).format(active)}</span>}
        </summary>
        {panel}
      </details>
    </aside>
  );
};

export default PharmacyFilters;
