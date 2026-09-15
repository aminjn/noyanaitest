import classes from "./PharmacyBooking.module.css";
import {
  Dispatch,
  Fragment,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { BookingCommon, DoctorBookingOptions } from "./BookingPage2";
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
import useLocale from "../Hooks/useLocale";
import BookingFilterSegment from "./BookingFilterSegment";
import Button from "../UI/Button";
import usePopup from "../Hooks/usePopup";
import BookingMap2 from "./BookingMap2";
import BookingFilterButton from "./BookingFilterButton";
import MultiSelectInputServer from "../UI/MultiSelectInputServer";
import Input from "../UI/Input";
import BookingResults from "./BookingResults";
import { IPharmacy } from "../DoctorPanel/Pharmacy/DoctorPharmaciesTab";
import PharmacyBookingCard from "./PharmacyBookingCard";
import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import { IDisease } from "../Admin/Disease/AdminManageDiseasesPage";
import { IServiceCategory } from "../Admin/ServiceCategory/AdminManageServiceCategoriesPage";
import BookingMeta from "./BookingMeta";
import { tsmRegular } from "../UI/Typography";

export type PharmacyBookingOptions = Partial<{
  query: string;
  productQuery: string;
  location: { coords: [number, number]; radius: number } | null;
  district: IDistrict[] | null;
  city: ICity | null;
  province: IProvince | null;
  category: IProductCategory | null;
}>;

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
  const getContent = useLocale();

  const { setPopup } = usePopup();

  return (
    <BookingFilter
      filtered={
        !Object.values(options).every((el) =>
          Array.isArray(el) ? !el.length : !el,
        )
      }
      onClear={() => setOptions({})}
      common={common}
      setCommon={setCommon}
      actives={
        <Fragment>
          {!!options.location && (
            <BookingSelectedFilter
              onClick={() =>
                setOptions((prev) => ({ ...prev, location: null }))
              }
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
              onClick={() =>
                setOptions((prev) => ({ ...prev, category: null }))
              }
            >
              {options.category.name}
            </BookingSelectedFilter>
          )}
        </Fragment>
      }
      top={
        <input
          className={`${classes.input} ${tsmRegular}`}
          onChange={(e) =>
            setOptions((prev) => ({ ...prev, query: e.target.value }))
          }
          placeholder={getContent("searchPharmacies")}
        />
      }
      segments={
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
      }
    />
  );
};

const PharmacyBooking = ({
  common,
  setCommon,
}: {
  common: BookingCommon;
  setCommon: Dispatch<SetStateAction<BookingCommon>>;
}) => {
  const [options, setOptions] = useState<PharmacyBookingOptions>({});

  const [debouncedOptions, setDebouncedOptions] =
    useDebounce<PharmacyBookingOptions>({ initialValue: options });

  useEffect(() => {
    setDebouncedOptions({ ...options });
  }, [options, setDebouncedOptions]);

  const params = useMemo(() => {
    const params = new URLSearchParams();
    const options = { ...debouncedOptions };
    params.append("sort", common.sort);
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
    return params;
  }, [common.sort, debouncedOptions]);

  const { data } = useSWR<{
    rows: IPharmacy[];
    count: { total: number }[];
  }>(
    `${API}/public/filterBookingPharmacy?${params.toString()}`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  return (
    <Fragment>
      <BookingHeader
        onChange={(e) =>
          setOptions((prev) => ({ ...prev, query: e.target.value }))
        }
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
            <PharmacyBookingCard
              key={pharmacy._id}
              node={pharmacy}
              view={common.view}
            />
          ))}
        </BookingResults>
      </BookingLayout>
      <BookingMeta
        title="pharmacyBookingMetaTitle"
        description="pharmacyBookingMetaDescription"
        label="pharmacyBookingMetaLabel"
        legend="pharmacyBookingMetaLegend"
      />
    </Fragment>
  );
};

export default PharmacyBooking;
