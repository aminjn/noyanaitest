import classes from "./PharmacyBooking.module.css";
import {
  Dispatch,
  Fragment,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  BookingCommon,
  bookingSorts,
  orgSort,
  DoctorBookingOptions,
} from "./BookingPage2";
import BookingHeader from "./BookingHeader";
import {
  ICity,
  IDistrict,
  IProvince,
} from "../Admin/Province/AdminManageProvincesPage";
import useDebounce from "../Hooks/useDebounce";
import { IProductCategory } from "../Admin/ProductCategory/AdminManageProductCategoriesPage";
import useSWR from "swr";
import BookingLayout from "./BookingLayout";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import BookingFilter from "./BookingFilter";
import BookingSelectedFilter from "./BookingSelectedFilter";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import BookingFilterSegment from "./BookingFilterSegment";
import Button from "../UI/Button";
import usePopup from "../Hooks/usePopup";
import BookingMap2 from "./BookingMap2";
import BookingFilterButton from "./BookingFilterButton";
import MultiSelectInputServer from "../UI/MultiSelectInputServer";
import Input from "../UI/Input";
import BookingResults from "./BookingResults";
import { IPharmacy } from "../DoctorPanel/Pharmacy/DoctorPharmaciesTab";
import CentreCard from "../UI/CentreCard";
import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import { IDisease } from "../Admin/Disease/AdminManageDiseasesPage";
import { IServiceCategory } from "../Admin/ServiceCategory/AdminManageServiceCategoriesPage";
import BookingMeta from "./BookingMeta";
import { tsmRegular } from "../UI/Typography";
import BookingFiltersMobile from "./BookingFiltersMobile";
import BookingFilterDrawerField from "./BookingFilterDrawerField";
import MultiSelectInput from "../UI/MultiSelectInput";
import BookingAdvancedSearchPopup, {
  AdvancedSearchLocationField,
  AdvancedSearchToggleField,
} from "./BookingAdvancedSearchPopup";
import ToggleInput from "../UI/ToggleInput";
import type { IBookingDescription } from "../Admin/BookingDescription/AdminManageBookingDescriptionsPage";

const NS: ContentNamespace[] = ["common", "booking", "openingHours"];

export type PharmacyBookingOptions = Partial<{
  query: string;
  productQuery: string;
  location: { coords: [number, number]; radius: number } | null;
  district: IDistrict[] | null;
  city: ICity | null;
  province: IProvince | null;
  category: IProductCategory | null;
  // open at night (شبانه‌روزی) and the insurer paying the prescription
  roundTheClock: boolean;
  // open at this minute, Tehran time (2026-10, backend Lib/openingHours.ts)
  openNow: boolean;
  insurance: { _id: string; name?: string }[];
}>;

// Builds the {filtered, onClear, top, actives, segments} props BookingFilter
// (desktop sidebar) and BookingFilterFullDrawer (mobile full-screen drawer)
// both render, so the two shells share this content instead of duplicating
// it.
const usePharmacyBookingFilterProps = ({
  options,
  setOptions,
}: {
  options: PharmacyBookingOptions;
  setOptions: Dispatch<SetStateAction<PharmacyBookingOptions>>;
}) => {
  const getContent = useScopedLocale(NS);

  const { setPopup } = usePopup();

  return {
    filtered: !Object.values(options).every((el) =>
      Array.isArray(el) ? !el.length : !el,
    ),
    onClear: () => setOptions({}),
    actives: (
      <Fragment>
        {!!options.location && (
          <BookingSelectedFilter
            onClick={() => setOptions((prev) => ({ ...prev, location: null }))}
          >
            {`${options.location.coords[0]}/${options.location.coords[1]} :: ${options.location.radius}`}
          </BookingSelectedFilter>
        )}
        {!!options.province && (
          <BookingSelectedFilter
            onClick={() =>
              setOptions((prev) => ({
                ...prev,
                province: null,
                city: null,
                district: null,
              }))
            }
          >
            {options.province.name}
          </BookingSelectedFilter>
        )}
        {!!options.city && (
          <BookingSelectedFilter
            onClick={() =>
              setOptions((prev) => ({ ...prev, city: null, district: null }))
            }
          >
            {options.city.name}
          </BookingSelectedFilter>
        )}
        {!!options.district?.length && (
          <Fragment>
            {options.district.map((d) => (
              <BookingSelectedFilter
                key={d._id}
                onClick={() =>
                  setOptions((prev) => {
                    const clone = { ...prev };
                    if (!clone.district) return { ...clone, district: [d] };
                    const index = clone.district.findIndex(
                      (el) => el._id === d._id,
                    );
                    if (index === -1) {
                      clone.district.push(d);
                    } else {
                      clone.district.splice(index, 1);
                    }
                    return clone;
                  })
                }
              >
                {d.name}
              </BookingSelectedFilter>
            ))}
          </Fragment>
        )}
        {!!options.category && (
          <BookingSelectedFilter
            onClick={() => setOptions((prev) => ({ ...prev, category: null }))}
          >
            {options.category.name}
          </BookingSelectedFilter>
        )}
        {!!options.roundTheClock && (
          <BookingSelectedFilter
            onClick={() => setOptions((prev) => ({ ...prev, roundTheClock: false }))}
          >
            {getContent("roundTheClock")}
          </BookingSelectedFilter>
        )}
        {!!options.openNow && (
          <BookingSelectedFilter onClick={() => setOptions((prev) => ({ ...prev, openNow: false }))}>
            {getContent("ohOpenNowFilter")}
          </BookingSelectedFilter>
        )}
        {options.insurance?.map((insurance) => (
          <BookingSelectedFilter
            key={insurance._id}
            onClick={() =>
              setOptions((prev) => ({
                ...prev,
                insurance: (prev.insurance || []).filter((el) => el._id !== insurance._id),
              }))
            }
          >
            {insurance.name || getContent("acceptedInsurance")}
          </BookingSelectedFilter>
        ))}
      </Fragment>
    ),
    top: (
      <input
        className={`${classes.input} ${tsmRegular}`}
        onChange={(e) =>
          setOptions((prev) => ({ ...prev, query: e.target.value }))
        }
        placeholder={getContent("searchPharmacies")}
      />
    ),
    segments: (
      <Fragment>
        <BookingFilterSegment
          title={getContent("geospetialPositoin")}
          action={
            <Button
              size="S"
              radius="High"
              variant="Secondary"
              mode="Inline"
              onClick={() =>
                setPopup(
                  "BookingMap2",
                  <BookingMap2
                    defaultValue={options.location || undefined}
                    onApply={(location) =>
                      setOptions((prev) => ({
                        ...prev,
                        location,
                        province: null,
                        city: null,
                        district: null,
                      }))
                    }
                  />,
                )
              }
            >
              {getContent("selectOnMap")}
            </Button>
          }
        >
          <BookingFilterButton
            title={getContent("province")}
            active={!!options.province}
          >
            <MultiSelectInputServer<IProvince>
              multi={false}
              value={options.province ? [options.province] : []}
              placeholder={getContent("selectProvince")}
              path={`${API}/public/province`}
              onChange={(e) =>
                setOptions((prev) =>
                  !!e[0]
                    ? e[0]._id === prev.province?._id
                      ? { ...prev, province: e[0], location: null }
                      : {
                          ...prev,
                          province: e[0],
                          city: null,
                          district: null,
                          location: null,
                        }
                    : {
                        ...prev,
                        province: null,
                        city: null,
                        district: null,
                        location: null,
                      },
                )
              }
              getOption={(node) => ({
                title: node.name || node._id,
                value: node._id,
              })}
            />
          </BookingFilterButton>
          {!!options.province && (
            <BookingFilterButton
              title={getContent("city")}
              active={!!options.city}
            >
              <MultiSelectInputServer<ICity>
                multi={false}
                value={options.city ? [options.city] : []}
                path={`${API}/public/city?province=${options.province._id}`}
                placeholder={getContent("selectCity")}
                getOption={(node) => ({
                  title: node.name || node._id,
                  value: node._id,
                })}
                onChange={(e) =>
                  setOptions((prev) =>
                    !!e[0]
                      ? e[0]._id === prev.city?._id
                        ? { ...prev, city: e[0], location: null }
                        : {
                            ...prev,
                            city: e[0],
                            district: null,
                            location: null,
                          }
                      : {
                          ...prev,
                          city: null,
                          district: null,
                          location: null,
                        },
                  )
                }
              />
            </BookingFilterButton>
          )}
          {!!options.city && (
            <BookingFilterButton
              title={getContent("district")}
              active={!!options.district?.length}
            >
              <Fragment>
                <MultiSelectInputServer
                  placeholder={getContent("selectDistrict")}
                  path={`${API}/public/district?city=${options.city._id}`}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      district: e,
                      location: null,
                    }))
                  }
                  value={options.district || []}
                  getOption={(node) => ({
                    title: node.name || node._id,
                    value: node._id,
                  })}
                />
              </Fragment>
            </BookingFilterButton>
          )}
        </BookingFilterSegment>
        <BookingFilterSegment title={getContent("pharmacies")}>
          <div className={classes.toggleRow}>
            <ToggleInput
              title={getContent("roundTheClockOnly")}
              value={!!options.roundTheClock}
              onChange={() =>
                setOptions((prev) => ({ ...prev, roundTheClock: !prev.roundTheClock }))
              }
            />
          </div>
          <div className={classes.toggleRow}>
            <ToggleInput
              title={getContent("ohOpenNowFilter")}
              value={!!options.openNow}
              onChange={() => setOptions((prev) => ({ ...prev, openNow: !prev.openNow }))}
            />
          </div>
          <BookingFilterButton
            title={getContent("acceptedInsurance")}
            active={!!options.insurance?.length}
          >
            <MultiSelectInputServer
              value={options.insurance || []}
              path={`${API}/public/search/insurance`}
              placeholder={getContent("selectInsurances")}
              getOption={(node) => ({ title: node.name || "", value: node._id })}
              onChange={(e) => setOptions((prev) => ({ ...prev, insurance: e }))}
            />
          </BookingFilterButton>
        </BookingFilterSegment>
        <BookingFilterSegment title={getContent("products")}>
          <input
            className={`${classes.input} ${tsmRegular}`}
            onChange={(e) =>
              setOptions((prev) => ({
                ...prev,
                productQuery: e.target.value,
              }))
            }
          />
          <BookingFilterButton
            title={getContent("category")}
            active={!!options.category}
          >
            <MultiSelectInputServer
              placeholder={getContent("selectCategory")}
              value={options.category ? [options.category] : []}
              multi={false}
              path={`${API}/public/productCategory`}
              getOption={(node) => ({
                title: node.name || "",
                value: node._id,
              })}
              onChange={(e) =>
                setOptions((prev) => ({ ...prev, category: e[0] || null }))
              }
            />
          </BookingFilterButton>
        </BookingFilterSegment>
      </Fragment>
    ),
  };
};

const PharmacyBookingFilter = ({
  common,
  setCommon,
  options,
  setOptions,
}: {
  common: BookingCommon;
  setCommon: Dispatch<SetStateAction<BookingCommon>>;
  options: PharmacyBookingOptions;
  setOptions: Dispatch<SetStateAction<PharmacyBookingOptions>>;
}) => {
  const filterProps = usePharmacyBookingFilterProps({ options, setOptions });

  return (
    <BookingFilter common={common} setCommon={setCommon} {...filterProps} />
  );
};

const PharmacyBooking = ({
  common,
  setCommon,
  descriptions,
}: {
  common: BookingCommon;
  setCommon: Dispatch<SetStateAction<BookingCommon>>;
  descriptions?: IBookingDescription[];
}) => {
  const [options, setOptions] = useState<PharmacyBookingOptions>({});

  const getContent = useScopedLocale(NS);

  const { setPopup } = usePopup();

  const fullFilterProps = usePharmacyBookingFilterProps({
    options,
    setOptions,
  });

  const [debouncedOptions, setDebouncedOptions] =
    useDebounce<PharmacyBookingOptions>({ initialValue: options });

  useEffect(() => {
    setDebouncedOptions({ ...options });
  }, [options, setDebouncedOptions]);

  const params = useMemo(() => {
    const params = new URLSearchParams();
    const options = { ...debouncedOptions };
    params.append("sort", orgSort(common.sort));
    params.append("page", "1");
    if (options.query) params.append("query", options.query);
    if (options.productQuery)
      params.append("productQuery", options.productQuery);
    if (options.location) {
      params.append("lat", options.location.coords[1].toString());
      params.append("lng", options.location.coords[0].toString());
      params.append("radius", options.location.radius.toString());
    }
    if (!!options.district?.length) {
      for (const district of options.district) {
        params.append("district", district._id);
      }
    }
    if (options.city) params.append("city", options.city._id);
    if (options.province) params.append("province", options.province._id);
    if (options.category) params.append("category", options.category._id);
    if (options.roundTheClock) params.append("roundTheClock", "1");
    if (options.openNow) params.append("openNow", "1");
    for (const insurance of options.insurance || [])
      params.append("insurance", insurance._id);
    return params;
  }, [common.sort, debouncedOptions]);

  const { data } = useSWR<{
    rows: IPharmacy[];
    count: { total: number }[];
  }>(
    `${API}/public/filterBookingPharmacy?${params.toString()}`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  // Flat field grid for BookingAdvancedSearchPopup, built from this file's own
  // PharmacyBookingOptions (the smallest of the three - just a product
  // category, location, and the in-store product search).
  const advancedSearchFields = (
    <Fragment>
      <MultiSelectInputServer
        placeholder={getContent("selectCategory")}
        value={options.category ? [options.category] : []}
        multi={false}
        path={`${API}/public/productCategory`}
        getOption={(node) => ({ title: node.name || "", value: node._id })}
        onChange={(e) =>
          setOptions((prev) => ({ ...prev, category: e[0] || null }))
        }
      />
      <MultiSelectInput
        placeholder={getContent("sortBy")}
        multi={false}
        value={[orgSort(common.sort)]}
        options={bookingSorts.map((el) => ({
          title: getContent(el),
          value: el,
        }))}
        onChange={(e) =>
          setCommon((prev) => ({
            ...prev,
            sort: bookingSorts.find((el) => el === e[0]) || prev.sort,
          }))
        }
      />
      <AdvancedSearchToggleField
        title={getContent("roundTheClockOnly")}
        active={!!options.roundTheClock}
        onClick={() => setOptions((prev) => ({ ...prev, roundTheClock: !prev.roundTheClock }))}
      />
      <AdvancedSearchToggleField
        title={getContent("ohOpenNowFilter")}
        active={!!options.openNow}
        onClick={() => setOptions((prev) => ({ ...prev, openNow: !prev.openNow }))}
      />
      <MultiSelectInputServer
        value={options.insurance || []}
        path={`${API}/public/search/insurance`}
        placeholder={getContent("selectInsurances")}
        getOption={(node) => ({ title: node.name || "", value: node._id })}
        onChange={(e) => setOptions((prev) => ({ ...prev, insurance: e }))}
      />
      <AdvancedSearchLocationField options={options} setOptions={setOptions} />
      <input
        className={`${classes.input} ${tsmRegular}`}
        placeholder={getContent("searchInProducts")}
        value={options.productQuery || ""}
        onChange={(e) =>
          setOptions((prev) => ({ ...prev, productQuery: e.target.value }))
        }
      />
    </Fragment>
  );

  return (
    <Fragment>
      <BookingHeader
        onChange={(e) =>
          setOptions((prev) => ({ ...prev, query: e.target.value }))
        }
        onAdvancedSearch={() =>
          setPopup(
            "BookingAdvancedSearch",
            <BookingAdvancedSearchPopup
              common={common}
              setCommon={setCommon}
              query={options.query}
              onQueryChange={(e) =>
                setOptions((prev) => ({ ...prev, query: e.target.value }))
              }
              filtered={fullFilterProps.filtered}
              onClear={fullFilterProps.onClear}
            >
              {advancedSearchFields}
            </BookingAdvancedSearchPopup>,
          )
        }
      />
      <BookingFiltersMobile
        common={common}
        setCommon={setCommon}
        {...fullFilterProps}
        filters={[
          {
            active: !!options.location,
            title: "location",
            drawer: (close) => (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <Button
                  variant="Primary"
                  mode="Fill"
                  radius="High"
                  size="L"
                  onClick={() => {
                    close();
                    setPopup(
                      "BookingMap2",
                      <BookingMap2
                        defaultValue={options.location || undefined}
                        onApply={(location) =>
                          setOptions((prev) => ({
                            ...prev,
                            location,
                            province: null,
                            city: null,
                            district: null,
                          }))
                        }
                      />,
                    );
                  }}
                >
                  {getContent("selectOnMap")}
                </Button>
                {!!options.location && (
                  <Button
                    variant="Error"
                    mode="Inline"
                    size="S"
                    radius="High"
                    onClick={() => {
                      setOptions((prev) => ({ ...prev, location: null }));
                      close();
                    }}
                  >
                    {getContent("remove")}
                  </Button>
                )}
              </div>
            ),
          },
          {
            active:
              !!options.province ||
              !!options.city ||
              !!options.district?.length,
            title: "province",
            drawer: (close) => (
              <BookingFilterDrawerField type="select" close={close}>
                <BookingFilterButton
                  title={getContent("province")}
                  active={!!options.province}
                >
                  <MultiSelectInputServer<IProvince>
                    multi={false}
                    value={options.province ? [options.province] : []}
                    placeholder={getContent("selectProvince")}
                    path={`${API}/public/province`}
                    onChange={(e) =>
                      setOptions((prev) =>
                        !!e[0]
                          ? e[0]._id === prev.province?._id
                            ? { ...prev, province: e[0], location: null }
                            : {
                                ...prev,
                                province: e[0],
                                city: null,
                                district: null,
                                location: null,
                              }
                          : {
                              ...prev,
                              province: null,
                              city: null,
                              district: null,
                              location: null,
                            },
                      )
                    }
                    getOption={(node) => ({
                      title: node.name || node._id,
                      value: node._id,
                    })}
                  />
                </BookingFilterButton>
                {!!options.province && (
                  <BookingFilterButton
                    title={getContent("city")}
                    active={!!options.city}
                  >
                    <MultiSelectInputServer<ICity>
                      multi={false}
                      value={options.city ? [options.city] : []}
                      path={`${API}/public/city?province=${options.province._id}`}
                      placeholder={getContent("selectCity")}
                      getOption={(node) => ({
                        title: node.name || node._id,
                        value: node._id,
                      })}
                      onChange={(e) =>
                        setOptions((prev) =>
                          !!e[0]
                            ? e[0]._id === prev.city?._id
                              ? { ...prev, city: e[0], location: null }
                              : {
                                  ...prev,
                                  city: e[0],
                                  district: null,
                                  location: null,
                                }
                            : {
                                ...prev,
                                city: null,
                                district: null,
                                location: null,
                              },
                        )
                      }
                    />
                  </BookingFilterButton>
                )}
                {!!options.city && (
                  <BookingFilterButton
                    title={getContent("district")}
                    active={!!options.district?.length}
                  >
                    <MultiSelectInputServer
                      placeholder={getContent("selectDistrict")}
                      path={`${API}/public/district?city=${options.city._id}`}
                      onChange={(e) =>
                        setOptions((prev) => ({
                          ...prev,
                          district: e,
                          location: null,
                        }))
                      }
                      value={options.district || []}
                      getOption={(node) => ({
                        title: node.name || node._id,
                        value: node._id,
                      })}
                    />
                  </BookingFilterButton>
                )}
              </BookingFilterDrawerField>
            ),
          },
          {
            active: !!options.category,
            title: "category",
            drawer: (close) => (
              <BookingFilterDrawerField type="select" close={close}>
                <MultiSelectInputServer
                  placeholder={getContent("selectCategory")}
                  value={options.category ? [options.category] : []}
                  multi={false}
                  path={`${API}/public/productCategory`}
                  getOption={(node) => ({
                    title: node.name || "",
                    value: node._id,
                  })}
                  onChange={(e) =>
                    setOptions((prev) => ({ ...prev, category: e[0] || null }))
                  }
                />
              </BookingFilterDrawerField>
            ),
          },
          {
            active: !!options.roundTheClock,
            title: "roundTheClock",
            drawer: (close) => (
              <BookingFilterDrawerField
                type="toggle"
                close={close}
                title={getContent("roundTheClockOnly")}
                value={!!options.roundTheClock}
                onChange={() =>
                  setOptions((prev) => ({ ...prev, roundTheClock: !prev.roundTheClock }))
                }
              />
            ),
          },
          {
            active: !!options.openNow,
            title: "ohOpenNowFilter",
            drawer: (close) => (
              <BookingFilterDrawerField
                type="toggle"
                close={close}
                title={getContent("ohOpenNowFilter")}
                value={!!options.openNow}
                onChange={() => setOptions((prev) => ({ ...prev, openNow: !prev.openNow }))}
              />
            ),
          },
          {
            active: !!options.insurance?.length,
            title: "acceptedInsurance",
            drawer: (close) => (
              <BookingFilterDrawerField type="select" close={close}>
                <MultiSelectInputServer
                  value={options.insurance || []}
                  path={`${API}/public/search/insurance`}
                  placeholder={getContent("selectInsurances")}
                  getOption={(node) => ({ title: node.name || "", value: node._id })}
                  onChange={(e) => setOptions((prev) => ({ ...prev, insurance: e }))}
                />
              </BookingFilterDrawerField>
            ),
          },
        ]}
      />
      <BookingLayout>
        <PharmacyBookingFilter
          common={common}
          setCommon={setCommon}
          options={options}
          setOptions={setOptions}
        />
        <BookingResults
          common={common}
          setCommon={setCommon}
          count={data?.count?.[0]?.total ?? 0}
        >
          {data?.rows.map((pharmacy) => (
            <CentreCard
              key={pharmacy._id}
              kind="pharmacy"
              node={pharmacy}
              variant={common.view === "Grid" ? "grid" : "row"}
            />
          ))}
        </BookingResults>
      </BookingLayout>
      <BookingMeta
        title="pharmacyBookingMetaTitle"
        description="pharmacyBookingMetaDescription"
        label="pharmacyBookingMetaLabel"
        legend="pharmacyBookingMetaLegend"
        descriptions={descriptions}
      />
    </Fragment>
  );
};

export default PharmacyBooking;
