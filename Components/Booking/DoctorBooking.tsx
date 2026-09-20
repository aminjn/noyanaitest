import {
  Dispatch,
  Fragment,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import BookingHeader from "./BookingHeader";
import classes from "./DoctorBooking.module.css";
import {
  BookingCommon,
  BookingPageDoctor,
  bookingSorts,
  DoctorBookingOptions,
} from "./BookingPage2";
import useDebounce from "../Hooks/useDebounce";
import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import BookingMeta from "./BookingMeta";
import DoctorBookingFilter, {
  useDoctorBookingFilterProps,
} from "./DoctorBookingFilters";
import DoctorBookinResult from "./DoctorBookingResults";
import BookingLayout from "./BookingLayout";
import BookingFiltersMobile from "./BookingFiltersMobile";
import useScopedLocale from "../Hooks/useScopedLocale";
import MultiSelectInputServer from "../UI/MultiSelectInputServer";
import MultiSelectInput from "../UI/MultiSelectInput";
import { doctorProfileTiers, genders } from "../DoctorPanel/DoctorPanelPage";
import InlineDateInput from "../UI/InlineDateInput";
import TimePicker from "../UI/TimePicker";
import filterClasses from "./DoctorBookingFilters.module.css";
import { t2xsRegular } from "../UI/Typography";
import Button from "../UI/Button";
import usePopup from "../Hooks/usePopup";
import BookingMap2 from "./BookingMap2";
import BookingFilterButton from "./BookingFilterButton";
import { ICity, IProvince } from "../Admin/Province/AdminManageProvincesPage";
import BookingFilterDrawerField from "./BookingFilterDrawerField";
import { doctorSessionTypes } from "../DoctorPanel/Calendar/DoctorCalendarDay";
import BookingAdvancedSearchPopup, {
  AdvancedSearchField,
  AdvancedSearchLocationField,
  AdvancedSearchToggleField,
} from "./BookingAdvancedSearchPopup";
import type { IBookingDescription } from "../Admin/BookingDescription/AdminManageBookingDescriptionsPage";

const DoctorBooking = ({
  common,
  setCommon,
  descriptions,
}: {
  common: BookingCommon;
  setCommon: Dispatch<SetStateAction<BookingCommon>>;
  descriptions?: IBookingDescription[];
}) => {
  const [options, setOptions] = useState<DoctorBookingOptions>({});

  const [debouncedOptions, setDebouncedOptions] =
    useDebounce<DoctorBookingOptions>({
      initialValue: options,
    });

  const getContent = useScopedLocale(["booking"]);

  const { setPopup } = usePopup();

  const fullFilterProps = useDoctorBookingFilterProps({ options, setOptions });

  useEffect(() => {
    setDebouncedOptions({ ...options });
  }, [options, setDebouncedOptions]);

  const params = useMemo(() => {
    const params = new URLSearchParams();
    const options = { ...debouncedOptions };
    params.append("sort", common.sort);
    params.append("page", "1");
    if (!!options.clinic?.length)
      for (const clinic of options.clinic) params.append("clinic", clinic._id);
    if (options.sessiontype?.length)
      for (const sessionType of options.sessiontype)
        params.append("sessiontype", sessionType);
    if (options.location) {
      params.append(
        "location.coords.lat",
        options.location.coords[1].toString(),
      );
      params.append(
        "location.coords.lng",
        options.location.coords[0].toString(),
      );
      params.append("location.radius", options.location.radius.toString());
    }
    if (options.province) params.append("province", options.province._id);
    if (options.city) params.append("city", options.city._id);
    if (options.district?.length)
      for (const district of options.district)
        params.append("district", district._id);
    if (options.speciality?.length)
      for (const speciality of options.speciality)
        params.append("speciality", speciality._id);
    if (options.disease?.length)
      for (const disease of options.disease)
        params.append("disease", disease._id);
    if (options.service?.length)
      for (const service of options.service)
        params.append("service", service._id);
    if (options.education?.length)
      for (const tier of options.education) params.append("tier", tier);
    if (options.gender) params.append("gender", options.gender);
    if (options.date) {
      if (options.date.start)
        params.append("date.start", options.date.start.getTime().toString());
      if (options.date.end)
        params.append("date.end", options.date.end.getTime().toString());
    }
    if (options.time) {
      if (options.time.start)
        params.append("time.start", options.time.start.toString());
      if (options.time.end)
        params.append("time.end", options.time.end.toString());
    }
    if (options.onlyAvailable) params.append("onlyAvailable", "true");
    if (options.ePresc) params.append("ePresc", "true");
    if (options.query) params.append("query", options.query);
    return params;
  }, [debouncedOptions, common]);

  const { data: data2 } = useSWR<{
    rows: BookingPageDoctor[];
    count: { total: number }[];
  }>(`${API}/public/filterBooking2?${params.toString()}`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  // Flat field grid for BookingAdvancedSearchPopup - the same options state
  // (and mostly the same field components) DoctorBookingFilters.tsx's
  // sidebar/accordion segments already bind to, just laid out as always-
  // visible grid cells instead of collapsible sections.
  const advancedSearchFields = (
    <Fragment>
      <MultiSelectInputServer
        value={options.clinic || []}
        placeholder={getContent("selectClinicsPlaceholder")}
        onChange={(e) => setOptions((prev) => ({ ...prev, clinic: e }))}
        getOption={(node) => ({ title: node.name || "", value: node._id })}
        path={`${API}/public/search/clinic`}
      />
      <MultiSelectInput
        value={options.sessiontype || []}
        options={doctorSessionTypes.map((el) => ({
          title: getContent(el),
          value: el,
        }))}
        placeholder={getContent("selectSessionType")}
        onChange={(e) =>
          setOptions((prev) => ({
            ...prev,
            sessiontype: doctorSessionTypes.filter((el) => e.includes(el)),
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
        value={options.service || []}
        path={`${API}/public/search/serviceCategory`}
        placeholder={getContent("selectServices")}
        getOption={(node) => ({ title: node.title || "", value: node._id })}
        onChange={(e) => setOptions((prev) => ({ ...prev, service: e }))}
      />
      <MultiSelectInputServer
        value={options.disease || []}
        path={`${API}/public/search/disease`}
        placeholder={getContent("selectDiseases")}
        getOption={(node) => ({ title: node.name || "", value: node._id })}
        onChange={(e) => setOptions((prev) => ({ ...prev, disease: e }))}
      />
      <MultiSelectInputServer
        placeholder={getContent("selectSpecilitis")}
        path={`${API}/public/search/speciality`}
        getOption={(node) => ({ title: node.name || "", value: node._id })}
        value={options.speciality || []}
        onChange={(e) => setOptions((prev) => ({ ...prev, speciality: e }))}
      />
      <AdvancedSearchToggleField
        title={getContent("onlyAvailable")}
        active={!!options.onlyAvailable}
        onClick={() =>
          setOptions((prev) => ({
            ...prev,
            onlyAvailable: !prev.onlyAvailable,
          }))
        }
      />
      <MultiSelectInput
        placeholder={getContent("selectGender")}
        multi={false}
        onChange={(e) =>
          setOptions((prev) => ({
            ...prev,
            gender: genders.find((g) => g === e[0]) || null,
          }))
        }
        options={genders.map((gender) => ({
          title: getContent(gender),
          value: gender,
        }))}
        value={options.gender ? [options.gender] : []}
      />
      <MultiSelectInput
        options={doctorProfileTiers.map((t) => ({
          title: getContent(t),
          value: t,
        }))}
        placeholder={getContent("selectEducation")}
        value={options.education || []}
        onChange={(e) =>
          setOptions((prev) => ({
            ...prev,
            education: doctorProfileTiers.filter((el) => e.includes(el)),
          }))
        }
      />
      <AdvancedSearchToggleField
        title={getContent("onlyWithEPresc")}
        active={!!options.ePresc}
        onClick={() =>
          setOptions((prev) => ({ ...prev, ePresc: !prev.ePresc }))
        }
      />
      <AdvancedSearchField label={getContent("sessionTime")}>
        <TimePicker
          prefix={getContent("from")}
          value={
            typeof options.time?.start === "number" ? options.time.start : null
          }
          onChange={(e) =>
            setOptions((prev) => ({
              ...prev,
              time: { ...prev.time, start: e || undefined },
            }))
          }
        />
        <TimePicker
          prefix={getContent("to")}
          value={
            typeof options.time?.end === "number" ? options.time.end : null
          }
          onChange={(e) =>
            setOptions((prev) => ({
              ...prev,
              time: { ...prev.time, end: e || undefined },
            }))
          }
        />
      </AdvancedSearchField>
      <AdvancedSearchField label={getContent("sessionDate")}>
        <InlineDateInput
          onChange={(e) =>
            setOptions((prev) => ({
              ...prev,
              date: { ...prev.date, start: e || undefined },
            }))
          }
          value={options.date?.start || null}
          prefix={getContent("from")}
        />
        <InlineDateInput
          onChange={(e) =>
            setOptions((prev) => ({
              ...prev,
              date: { ...prev.date, end: e || undefined },
            }))
          }
          value={options.date?.end || null}
          prefix={getContent("to")}
        />
      </AdvancedSearchField>
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
            active: !!options.speciality?.length,
            title: "specialityGroup",
            drawer: (close) => (
              <BookingFilterDrawerField type="select" close={close}>
                <MultiSelectInputServer
                  placeholder={getContent("selectSpecilitis")}
                  path={`${API}/public/search/speciality`}
                  getOption={(node) => ({
                    title: node.name || "",
                    value: node._id,
                  })}
                  value={options.speciality || []}
                  onChange={(e) =>
                    setOptions((prev) => ({ ...prev, speciality: e }))
                  }
                />
              </BookingFilterDrawerField>
            ),
          },
          {
            active: !!options.disease?.length,
            title: "disease",
            drawer: (close) => (
              <BookingFilterDrawerField type="select" close={close}>
                <MultiSelectInputServer
                  value={options.disease || []}
                  path={`${API}/public/search/disease`}
                  placeholder={getContent("selectDiseases")}
                  getOption={(node) => ({
                    title: node.name || "",
                    value: node._id,
                  })}
                  onChange={(e) =>
                    setOptions((prev) => ({ ...prev, disease: e }))
                  }
                />
              </BookingFilterDrawerField>
            ),
          },
          {
            active: !!options.service?.length,
            title: "service",
            drawer: (close) => (
              <BookingFilterDrawerField type="select" close={close}>
                <MultiSelectInputServer
                  value={options.service || []}
                  path={`${API}/public/search/serviceCategory`}
                  placeholder={getContent("selectServices")}
                  getOption={(node) => ({
                    title: node.title || "",
                    value: node._id,
                  })}
                  onChange={(e) =>
                    setOptions((prev) => ({ ...prev, service: e }))
                  }
                />
              </BookingFilterDrawerField>
            ),
          },
          {
            active: !!options.education?.length,
            title: "educationLevel",
            drawer: (close) => (
              <BookingFilterDrawerField type="select" close={close}>
                <MultiSelectInput
                  options={doctorProfileTiers.map((t) => ({
                    title: getContent(t),
                    value: t,
                  }))}
                  placeholder={getContent("selectEducation")}
                  value={options.education || []}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      education: doctorProfileTiers.filter((el) =>
                        e.includes(el),
                      ),
                    }))
                  }
                />
              </BookingFilterDrawerField>
            ),
          },
          {
            active: !!options.gender,
            title: "gender",
            drawer: (close) => (
              <BookingFilterDrawerField type="select" close={close}>
                <MultiSelectInput
                  placeholder={getContent("selectGender")}
                  multi={false}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      gender: genders.find((g) => g === e[0]) || null,
                    }))
                  }
                  options={genders.map((gender) => ({
                    title: getContent(gender),
                    value: gender,
                  }))}
                  value={options.gender ? [options.gender] : []}
                />
              </BookingFilterDrawerField>
            ),
          },
          {
            active:
              !!options.date && (!!options.date.start || !!options.date.end),
            title: "sessionDate",
            drawer: (close) => (
              <BookingFilterDrawerField type="select" close={close}>
                <div className={filterClasses.date}>
                  <span
                    className={`${filterClasses.inlineTitle} ${t2xsRegular}`}
                  >
                    {getContent("sessionDate")}
                  </span>
                  <InlineDateInput
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        date: { ...prev.date, start: e || undefined },
                      }))
                    }
                    value={options.date?.start || null}
                    prefix={getContent("from")}
                  />
                  <InlineDateInput
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        date: { ...prev.date, end: e || undefined },
                      }))
                    }
                    value={options.date?.end || null}
                    prefix={getContent("to")}
                  />
                </div>
              </BookingFilterDrawerField>
            ),
          },
          {
            active: !!options.time,
            title: "sessionTime",
            drawer: (close) => (
              <BookingFilterDrawerField type="select" close={close}>
                <div className={filterClasses.date}>
                  <span className={filterClasses.inlineTitle}>
                    {getContent("sessionTime")}
                  </span>
                  <TimePicker
                    prefix={getContent("from")}
                    value={
                      typeof options.time?.start === "number"
                        ? options.time.start
                        : null
                    }
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        time: { ...prev.time, start: e || undefined },
                      }))
                    }
                  />
                  <TimePicker
                    prefix={getContent("to")}
                    value={
                      typeof options.time?.end === "number"
                        ? options.time.end
                        : null
                    }
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        time: { ...prev.time, end: e || undefined },
                      }))
                    }
                  />
                </div>
              </BookingFilterDrawerField>
            ),
          },
          {
            active: !!options.onlyAvailable,
            title: "onlyAvailable",
            drawer: (close) => (
              <BookingFilterDrawerField
                type="toggle"
                close={close}
                title={getContent("onlyAvailable")}
                value={!!options.onlyAvailable}
                onChange={() =>
                  setOptions((prev) => ({
                    ...prev,
                    onlyAvailable: !prev.onlyAvailable,
                  }))
                }
              />
            ),
          },
          {
            active: !!options.ePresc,
            title: "onlyWithEPresc",
            drawer: (close) => (
              <BookingFilterDrawerField
                type="toggle"
                close={close}
                title={getContent("onlyWithEPresc")}
                value={!!options.ePresc}
                onChange={() =>
                  setOptions((prev) => ({ ...prev, ePresc: !prev.ePresc }))
                }
              />
            ),
          },
        ]}
      />
      <BookingLayout>
        <DoctorBookingFilter
          options={options}
          setOptions={setOptions}
          common={common}
          setCommon={setCommon}
        />
        <DoctorBookinResult
          common={common}
          setCommon={setCommon}
          data={data2?.rows}
          count={data2?.count?.[0]?.total ?? 0}
          options={options}
          setOptions={setOptions}
          descriptions={descriptions}
        />
      </BookingLayout>
      <BookingMeta
        title="doctorBookingMetaTitle"
        description="doctorBookingMetaDescription"
        label="doctorBookingMetaLabel"
        legend="doctorBookingMetaLegend"
        descriptions={descriptions}
      />
    </Fragment>
  );
};

export default DoctorBooking;
