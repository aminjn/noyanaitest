import {
  Dispatch,
  Fragment,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { BookingCommon, bookingSorts } from "./BookingPage2";
import BookingHeader from "./BookingHeader";
import { IClinicCategory } from "../Admin/ClinicCategory/AdminManageClinicCategoriesPage";
import {
  DoctorSessionType,
  doctorSessionTypes,
} from "../DoctorPanel/Calendar/DoctorCalendarDay";
import {
  ICity,
  IDistrict,
  IProvince,
} from "../Admin/Province/AdminManageProvincesPage";
import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import { IDisease } from "../Admin/Disease/AdminManageDiseasesPage";
import { IServiceCategory } from "../Admin/ServiceCategory/AdminManageServiceCategoriesPage";
import useDebounce from "../Hooks/useDebounce";
import BookingLayout from "./BookingLayout";
import BookingFilter from "./BookingFilter";
import MultiSelectInputServer from "../UI/MultiSelectInputServer";
import { API } from "../config";
import useLocale from "../Hooks/useLocale";
import MultiSelectInput, { MultiSelectOption } from "../UI/MultiSelectInput";
import BookingSelectedFilter from "./BookingSelectedFilter";
import BookingFilterSegment from "./BookingFilterSegment";
import Button from "../UI/Button";
import usePopup from "../Hooks/usePopup";
import BookingMap2 from "./BookingMap2";
import BookingFilterButton from "./BookingFilterButton";
import { IClinic } from "../Admin/Clinic/AdminManageClinicsPage";
import useSWR from "swr";
import { fetcher } from "../helpers/fetcher";
import BookingResults from "./BookingResults";
import CommonCenterCard from "./CommonCenterCard";
import BookingMeta from "./BookingMeta";
import classes from "./ClinicBooking.module.css";
import { tsmRegular } from "../UI/Typography";
import BookingFiltersMobile from "./BookingFiltersMobile";
import BookingFilterDrawerField from "./BookingFilterDrawerField";
import BookingAdvancedSearchPopup, {
  AdvancedSearchLocationField,
} from "./BookingAdvancedSearchPopup";
import type { IBookingDescription } from "../Admin/BookingDescription/AdminManageBookingDescriptionsPage";

type ClinicBookingOptions = Partial<{
  query: string;
  location: { coords: [number, number]; radius: number } | null;
  district: IDistrict[] | null;
  city: ICity | null;
  province: IProvince | null;
  category: IClinicCategory[] | null;
  sessionType: DoctorSessionType[] | null;
  speciality: ISpeciality[];
  disease: IDisease[];
  service: IServiceCategory[];
}>;

// Builds the {filtered, onClear, top, actives, segments} props BookingFilter
// (desktop sidebar) and BookingFilterFullDrawer (mobile full-screen drawer)
// both render, so the two shells share this content instead of duplicating
// it.
const useClinicBookingFilterProps = ({
  options,
  setOptions,
}: {
  options: ClinicBookingOptions;
  setOptions: Dispatch<SetStateAction<ClinicBookingOptions>>;
}) => {
  const getContent = useLocale();

  const { setPopup } = usePopup();

  return {
    filtered: !Object.values(options).every((el) =>
      Array.isArray(el) ? !el.length : !el,
    ),
    onClear: () => setOptions({}),
    top: (
      <Fragment>
        <input
          onChange={(e) =>
            setOptions((prev) => ({ ...prev, query: e.target.value }))
          }
          placeholder={getContent("searchInClinics")}
          className={`${classes.input} ${tsmRegular}`}
        />
        <MultiSelectInputServer
          path={`${API}/public/clinicCategory`}
          value={options.category || []}
          onChange={(e) => setOptions((prev) => ({ ...prev, category: e }))}
          placeholder={getContent("selectClinicCategory")}
          getOption={(node) => ({
            title: node.name || node._id,
            value: node._id,
          })}
        />
        <MultiSelectInput
          options={doctorSessionTypes.reduce(
            (acc, el) => [...acc, { title: getContent(el), value: el }],
            [] as MultiSelectOption[],
          )}
          placeholder={getContent("selectSessionType")}
          multi={true}
          value={options.sessionType || []}
          onChange={(e) =>
            setOptions((prev) => ({
              ...prev,
              sessionType: e as DoctorSessionType[],
            }))
          }
        />
      </Fragment>
    ),
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
        {!!options.category?.length &&
          options.category.map((category) => (
            <BookingSelectedFilter
              key={category._id}
              onClick={() =>
                setOptions((prev) => {
                  const clone = { ...prev };
                  if (!clone.category) return prev;
                  const index = clone.category.findIndex(
                    (el) => el._id === category._id,
                  );
                  if (index > -1) {
                    clone.category.splice(index, 1);
                  }
                  return clone;
                })
              }
            >
              {category.name}
            </BookingSelectedFilter>
          ))}
        {!!options.sessionType?.length &&
          options.sessionType.map((st) => (
            <BookingSelectedFilter
              key={st}
              onClick={() =>
                setOptions((prev) => {
                  const clone = { ...prev };
                  if (!clone.sessionType) return prev;
                  const index = clone.sessionType.indexOf(st);
                  if (index > -1) {
                    clone.sessionType.splice(index, 1);
                  }
                  return clone;
                })
              }
            >
              {getContent(st)}
            </BookingSelectedFilter>
          ))}
        {!!options.speciality?.length &&
          options.speciality.map((spec) => (
            <BookingSelectedFilter
              key={spec._id}
              onClick={() =>
                setOptions((prev) => {
                  const clone = { ...prev };
                  if (!clone.speciality) return prev;
                  const index = clone.speciality.findIndex(
                    (el) => el._id === spec._id,
                  );
                  if (index > -1) {
                    clone.speciality.splice(index, 1);
                  }
                  return clone;
                })
              }
            >
              {spec.name}
            </BookingSelectedFilter>
          ))}
        {!!options.disease?.length &&
          options.disease.map((disease) => (
            <BookingSelectedFilter
              key={disease._id}
              onClick={() =>
                setOptions((prev) => {
                  const clone = { ...prev };
                  if (!clone.disease) return prev;
                  const index = clone.disease.findIndex(
                    (el) => el._id === disease._id,
                  );
                  if (index > -1) {
                    clone.disease.splice(index, 1);
                  }
                  return clone;
                })
              }
            >
              {disease.name}
            </BookingSelectedFilter>
          ))}
        {!!options.service?.length &&
          options.service.map((service) => (
            <BookingSelectedFilter
              key={service._id}
              onClick={() =>
                setOptions((prev) => {
                  const clone = { ...prev };
                  if (!clone.service) return prev;
                  const index = clone.service.findIndex(
                    (el) => el._id === service._id,
                  );
                  if (index > -1) {
                    clone.service.splice(index, 1);
                  }
                  return clone;
                })
              }
            >
              {service.title}
            </BookingSelectedFilter>
          ))}
      </Fragment>
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
        <BookingFilterSegment title={getContent("category")}>
          <MultiSelectInputServer
            placeholder={getContent("selectSpecilitis")}
            path={`${API}/public/search/speciality`}
            getOption={(node) => ({
              title: node.name || "",
              value: node._id,
            })}
            value={options.speciality || []}
            onChange={(e) => setOptions((prev) => ({ ...prev, speciality: e }))}
          />
          <BookingFilterButton
            title={getContent("disease")}
            active={!!options.disease?.length}
          >
            <MultiSelectInputServer
              value={options.disease || []}
              path={`${API}/public/search/disease`}
              placeholder={getContent("selectDiseases")}
              getOption={(node) => ({
                title: node.name || "",
                value: node._id,
              })}
              onChange={(e) => setOptions((prev) => ({ ...prev, disease: e }))}
            />
          </BookingFilterButton>
          <BookingFilterButton
            title={getContent("service")}
            active={!!options.service?.length}
          >
            <MultiSelectInputServer
              value={options.service || []}
              path={`${API}/public/search/serviceCategory`}
              placeholder={getContent("selectServices")}
              getOption={(node) => ({
                title: node.title || "",
                value: node._id,
              })}
              onChange={(e) => setOptions((prev) => ({ ...prev, service: e }))}
            />
          </BookingFilterButton>
        </BookingFilterSegment>
      </Fragment>
    ),
  };
};

const ClinicBookingFilter = ({
  common,
  setCommon,
  options,
  setOptions,
}: {
  common: BookingCommon;
  setCommon: Dispatch<SetStateAction<BookingCommon>>;
  options: ClinicBookingOptions;
  setOptions: Dispatch<SetStateAction<ClinicBookingOptions>>;
}) => {
  const filterProps = useClinicBookingFilterProps({ options, setOptions });

  return (
    <BookingFilter common={common} setCommon={setCommon} {...filterProps} />
  );
};

const ClinicBooking = ({
  common,
  setCommon,
  descriptions,
}: {
  common: BookingCommon;
  setCommon: Dispatch<SetStateAction<BookingCommon>>;
  descriptions?: IBookingDescription[];
}) => {
  const [options, setOptions] = useState<ClinicBookingOptions>({});

  const getContent = useLocale();

  const { setPopup } = usePopup();

  const fullFilterProps = useClinicBookingFilterProps({ options, setOptions });

  const [debouncedOptions, setDebouncedOptions] =
    useDebounce<ClinicBookingOptions>({ initialValue: options });

  useEffect(() => {
    setDebouncedOptions({ ...options });
  }, [options, setDebouncedOptions]);

  const params = useMemo(() => {
    const params = new URLSearchParams();
    const options = { ...debouncedOptions };
    params.append("sort", common.sort);
    params.append("page", "1");
    if (options.query) params.append("query", options.query);
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
    if (options.category?.length)
      for (const category of options.category)
        params.append("category", category._id);
    if (options.sessionType?.length)
      for (const st of options.sessionType) params.append("sessionType", st);
    if (options.speciality?.length)
      for (const speciality of options.speciality)
        params.append("speciality", speciality._id);
    if (options.disease?.length)
      for (const disease of options.disease)
        params.append("disease", disease._id);
    if (options.service?.length)
      for (const service of options.service)
        params.append("service", service._id);
    return params;
  }, [common.sort, debouncedOptions]);

  const { data } = useSWR<{
    rows: IClinic[];
    count: { total: number }[];
  }>(`${API}/public/filterBookingClinic?${params.toString()}`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  // Flat field grid for BookingAdvancedSearchPopup, built from this file's own
  // ClinicBookingOptions/useClinicBookingFilterProps fields (a smaller set
  // than Doctor's since clinics have no gender/education/date/time options).
  const advancedSearchFields = (
    <Fragment>
      <MultiSelectInputServer
        path={`${API}/public/clinicCategory`}
        value={options.category || []}
        onChange={(e) => setOptions((prev) => ({ ...prev, category: e }))}
        placeholder={getContent("selectClinicCategory")}
        getOption={(node) => ({
          title: node.name || node._id,
          value: node._id,
        })}
      />
      <MultiSelectInput
        options={doctorSessionTypes.reduce(
          (acc, el) => [...acc, { title: getContent(el), value: el }],
          [] as MultiSelectOption[],
        )}
        placeholder={getContent("selectSessionType")}
        multi={true}
        value={options.sessionType || []}
        onChange={(e) =>
          setOptions((prev) => ({
            ...prev,
            sessionType: e as DoctorSessionType[],
          }))
        }
      />
      <MultiSelectInput
        placeholder={getContent("sortBy")}
        multi={false}
        value={[common.sort]}
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
      <AdvancedSearchLocationField options={options} setOptions={setOptions} />
      <MultiSelectInputServer
        placeholder={getContent("selectSpecilitis")}
        path={`${API}/public/search/speciality`}
        getOption={(node) => ({ title: node.name || "", value: node._id })}
        value={options.speciality || []}
        onChange={(e) => setOptions((prev) => ({ ...prev, speciality: e }))}
      />
      <MultiSelectInputServer
        value={options.disease || []}
        path={`${API}/public/search/disease`}
        placeholder={getContent("selectDiseases")}
        getOption={(node) => ({ title: node.name || "", value: node._id })}
        onChange={(e) => setOptions((prev) => ({ ...prev, disease: e }))}
      />
      <MultiSelectInputServer
        value={options.service || []}
        path={`${API}/public/search/serviceCategory`}
        placeholder={getContent("selectServices")}
        getOption={(node) => ({ title: node.title || "", value: node._id })}
        onChange={(e) => setOptions((prev) => ({ ...prev, service: e }))}
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
            active: !!options.category?.length,
            title: "category",
            drawer: (close) => (
              <BookingFilterDrawerField type="select" close={close}>
                <MultiSelectInputServer
                  path={`${API}/public/clinicCategory`}
                  value={options.category || []}
                  onChange={(e) =>
                    setOptions((prev) => ({ ...prev, category: e }))
                  }
                  placeholder={getContent("selectClinicCategory")}
                  getOption={(node) => ({
                    title: node.name || node._id,
                    value: node._id,
                  })}
                />
              </BookingFilterDrawerField>
            ),
          },
        ]}
      />
      <BookingLayout>
        <ClinicBookingFilter
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
          {data?.rows.map((clinic) => (
            <CommonCenterCard
              key={clinic._id}
              name={clinic.name || ""}
              nodeName="clinic"
              slug={clinic.slug || clinic._id}
              address={clinic.address}
              avatar={clinic.image}
              banner={clinic.image}
              coords={clinic.location?.coordinates}
              summary={clinic.summary}
              view={common.view}
            />
          ))}
        </BookingResults>
      </BookingLayout>
      <BookingMeta
        descriptions={descriptions}
        title="clinicBookingMetaTitle"
        description="clinicBookingMetaDescription"
        label="clinicBookingMetaLabel"
        legend="clinicBookingMetaLegend"
      />
    </Fragment>
  );
};

export default ClinicBooking;
