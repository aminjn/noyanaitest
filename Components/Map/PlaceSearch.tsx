"use client";

import {
  KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import classes from "./PlaceSearch.module.css";
import Ixon from "@/Components/UI/Ixon";
import SearchIcon from "@/Components/Icons/SearchIcon";
import LoadingIcon from "@/Components/Icons/LoadingIcon";
import {
  autocomplete,
  geocode,
  getMapConfig,
  LatLng,
  newSessionToken,
  Prediction,
} from "./nexamap";

export type PlacePick = { location: LatLng; label: string };

const DEBOUNCE_MS = 250;
const MIN_CHARS = 2;

const validPoint = (p?: Partial<LatLng> | null): p is LatLng =>
  !!p &&
  typeof p.lat === "number" &&
  typeof p.lng === "number" &&
  Number.isFinite(p.lat) &&
  Number.isFinite(p.lng);

const labelOf = (p: Prediction) =>
  [p.main_text, p.secondary_text].filter(Boolean).join("، ");

// Address / place search of every location picker (admin PointPicker,
// panel LocationPicker, PolygonPicker): NexaMap autocomplete through our
// gateway, one session token per typing session (NexaMap bills a session,
// not each keystroke), biased to `near`. It is used by the admin panel and
// by the public panels, so it never translates on its own: the caller hands
// it already-translated texts.
const PlaceSearch = ({
  onPick,
  near,
  placeholder,
  noResults,
  errorText,
  locale,
  ariaLabel,
  autoFocus,
}: {
  onPick: (pick: PlacePick) => unknown;
  // results closer to this point rank first (map centre or the user)
  near?: LatLng | null;
  placeholder: string;
  noResults: string;
  // shown when the search request fails (provider down, network)
  errorText?: string;
  // BCP-47 tag for the distance ("fa-IR", "en-US"...)
  locale?: string;
  ariaLabel?: string;
  autoFocus?: boolean;
}) => {
  const listId = useId();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [query, setQuery] = useState<string>("");
  const [items, setItems] = useState<Prediction[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [active, setActive] = useState<number>(-1);
  const [loading, setLoading] = useState<boolean>(false);
  const [failed, setFailed] = useState<boolean>(false);
  // the query the current items answer (no "no results" flash while typing)
  const [answered, setAnswered] = useState<string>("");

  const sessionRef = useRef<string | null>(null);
  const requestRef = useRef<number>(0);
  const nearRef = useRef(near);
  nearRef.current = near;
  const rootRef = useRef<HTMLDivElement>(null);
  // a pick writes its label into the box: that is not new typing
  const pickedRef = useRef<string | null>(null);

  // hidden when the map isn't configured or search is turned off
  useEffect(() => {
    let alive = true;
    getMapConfig().then((config) => {
      if (alive) setEnabled(!!config?.enabled && config.features?.search !== false);
    });
    return () => {
      alive = false;
    };
  }, []);

  // debounced autocomplete
  useEffect(() => {
    const q = query.trim();
    if (pickedRef.current !== null && pickedRef.current === query) return;
    pickedRef.current = null;
    if (q.length < MIN_CHARS) {
      requestRef.current++;
      setItems([]);
      setLoading(false);
      setFailed(false);
      return;
    }
    if (!sessionRef.current) sessionRef.current = newSessionToken();
    const id = ++requestRef.current;
    const timer = setTimeout(() => {
      setLoading(true);
      const bias = nearRef.current;
      autocomplete(q, {
        near: validPoint(bias) ? bias : null,
        sessionToken: sessionRef.current || undefined,
        limit: 8,
      })
        .then((data) => {
          if (id !== requestRef.current) return;
          const list = Array.isArray(data?.predictions)
            ? data.predictions.filter((p) => !!p && !!p.main_text)
            : [];
          setItems(list);
          setAnswered(q);
          setFailed(false);
          setActive(list.length ? 0 : -1);
          setOpen(true);
        })
        .catch(() => {
          if (id !== requestRef.current) return;
          setItems([]);
          setAnswered(q);
          setFailed(true);
          setOpen(true);
        })
        .finally(() => {
          if (id === requestRef.current) setLoading(false);
        });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  // a click outside closes the list
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const finish = useCallback(
    (pick: PlacePick) => {
      // the session ends with a pick: the next typing is a new session
      sessionRef.current = null;
      requestRef.current++;
      pickedRef.current = pick.label;
      setQuery(pick.label);
      setItems([]);
      setOpen(false);
      setActive(-1);
      setLoading(false);
      onPick(pick);
    },
    [onPick],
  );

  const geocodeText = useCallback(
    async (text: string, label = text) => {
      const q = text.trim();
      if (!q) return;
      const id = ++requestRef.current;
      setLoading(true);
      try {
        const results = await geocode(q);
        if (id !== requestRef.current) return;
        const hit = Array.isArray(results)
          ? results.find((r) => validPoint(r?.location))
          : undefined;
        if (!hit) {
          setItems([]);
          setAnswered(query.trim());
          setFailed(false);
          setOpen(true);
          return;
        }
        finish({ location: hit.location, label: label || hit.formatted_address || q });
      } catch {
        if (id !== requestRef.current) return;
        setAnswered(query.trim());
        setFailed(true);
        setOpen(true);
      } finally {
        if (id === requestRef.current) setLoading(false);
      }
    },
    [finish, query],
  );

  const choose = useCallback(
    (p: Prediction) => {
      const label = labelOf(p);
      if (validPoint(p.location)) finish({ location: p.location, label });
      // a prediction without a point (a street, an address): geocode it
      else geocodeText(label, label);
    },
    [finish, geocodeText],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      setActive((i) => (items.length ? (i + 1) % items.length : -1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) =>
        items.length ? (i <= 0 ? items.length - 1 : i - 1) : -1,
      );
    } else if (e.key === "Enter") {
      // never submits the surrounding form
      e.preventDefault();
      if (open && active >= 0 && items[active]) choose(items[active]);
      else geocodeText(query);
    } else if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        setOpen(false);
      }
    }
  };

  const distance = useMemo(() => {
    const make = (unit: "meter" | "kilometer", digits: number) => {
      try {
        return new Intl.NumberFormat(locale, {
          style: "unit",
          unit,
          unitDisplay: "short",
          maximumFractionDigits: digits,
        });
      } catch {
        return new Intl.NumberFormat(locale, { maximumFractionDigits: digits });
      }
    };
    const m = make("meter", 0);
    const km = make("kilometer", 1);
    return (meters?: number) => {
      if (typeof meters !== "number" || !Number.isFinite(meters)) return "";
      return meters < 1000
        ? m.format(Math.round(meters / 10) * 10)
        : km.format(meters / 1000);
    };
  }, [locale]);

  if (!enabled) return null;

  const showList =
    open &&
    query.trim().length >= MIN_CHARS &&
    (items.length > 0 || (!loading && answered === query.trim()));
  const optionId = (i: number) => `${listId}-o${i}`;

  return (
    <div className={classes.main} ref={rootRef}>
      <div className={classes.field}>
        <span className={classes.icon} aria-hidden>
          <Ixon width="1.25rem">{loading ? <LoadingIcon /> : <SearchIcon />}</Ixon>
        </span>
        <input
          className={classes.input}
          type="search"
          role="combobox"
          aria-label={ariaLabel || placeholder}
          aria-autocomplete="list"
          aria-expanded={showList && items.length > 0}
          aria-controls={listId}
          aria-activedescendant={
            showList && active >= 0 && items[active] ? optionId(active) : undefined
          }
          autoComplete="off"
          enterKeyHint="search"
          autoFocus={autoFocus}
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (items.length) setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />
      </div>
      {showList && (
        <ul className={classes.list} id={listId} role="listbox">
          {items.length ? (
            items.map((p, i) => (
              <li
                key={`${p.place_id || i}-${i}`}
                id={optionId(i)}
                role="option"
                aria-selected={i === active}
                className={`${classes.option} ${i === active ? classes.active : ""}`}
                // mousedown, so the input's blur doesn't win
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(p);
                }}
                onMouseEnter={() => setActive(i)}
              >
                <span className={classes.texts}>
                  <span className={classes.mainText}>{p.main_text}</span>
                  {!!p.secondary_text && (
                    <span className={classes.secondary}>{p.secondary_text}</span>
                  )}
                </span>
                {!!distance(p.distance_m) && (
                  <span className={classes.distance}>{distance(p.distance_m)}</span>
                )}
              </li>
            ))
          ) : (
            <li className={classes.empty} role="presentation">
              {failed ? errorText || noResults : noResults}
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default PlaceSearch;
