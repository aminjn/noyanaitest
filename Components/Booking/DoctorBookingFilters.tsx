import { Dispatch, Fragment, SetStateAction } from "react";
import classes from "./DoctorBookingFilters.module.css";
import { BookingCommon, DoctorBookingOptions } from "./BookingPage2";
import useLocale from "../Hooks/useLocale";
import { doctorSessionTypes } from "../DoctorPanel/Calendar/DoctorCalendarDay";
import MultiSelectInput from "../UI/MultiSelectInput";
import Button from "../UI/Button";
import { dateToString } from "../UI/FormatDate";
import { numberToTime } from "../DoctorPanel/Calendar/AddSessionsAgent";
import ToggleInput from "../UI/ToggleInput";
import { t2xsRegular } from "../UI/Typography";
import MultiSelectInputServer from "../UI/MultiSelectInputServer";
import { API } from "../config";
import { doctorProfileTiers, genders } from "../DoctorPanel/DoctorPanelPage";
import InlineDateInput from "../UI/InlineDateInput";
import TimePicker from "../UI/TimePicker";
import usePopup from "../Hooks/usePopup";
import BookingMap2 from "./BookingMap2";
import { ICity, IProvince } from "../Admin/Province/AdminManageProvincesPage";
import BookingFilter from "./BookingFilter";
import BookingFilterSegment from "./BookingFilterSegment";
import BookingSelectedFilter from "./BookingSelectedFilter";
import BookingFilterButton from "./BookingFilterButton";

const FilterButtonBool = ({
  active,
  onClick,
  title,
}: {
  title: string;
  active: boolean;
  onClick: () => unknown;
}) => {
  return (
    <div className={classes.filterButton}>
      <span>{title}</span>
      <ToggleInput
        className={classes.boolFilterToggle}
        onChange={onClick}
        value={active}
      />
    </div>
  );
};

// TODO: sort: bestScore / mostViewd / mostAvailvable

const DoctorBookingFilter = ({
  options,
  setOptions,
  common,
  setCommon,
}: {
  options: DoctorBookingOptions;
  setOptions: Dispatch<SetStateAction<DoctorBookingOptions>>;
  common: BookingCommon;
  setCommon: Dispatch<SetStateAction<BookingCommon>>;
}) => {
  const getContent = useLocale();

  const { setPopup } = usePopup();

  return (
    <BookingFilter
      common={common}
      setCommon={setCommon}
      filtered={
        !Object.values(options).every((el) =>
          Array.isArray(el) ? !el.length : !el,
        )
      }
      onClear={() => setOptions({})}
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
          {!!options.speciality?.length &&
            options.speciality.map((speciality) => (
              <BookingSelectedFilter
                key={speciality._id}
                onClick={() => {
                  setOptions((prev) => {
                    const clone = { ...prev };
                    if (!clone.speciality)
                      return { ...clone, speciality: [speciality] };
                    const index = clone.speciality.findIndex(
                      (el) => el._id === speciality._id,
                    );
                    if (index === -1) {
                      clone.speciality.push(speciality);
                    } else {
                      clone.speciality.splice(index, 1);
                    }
                    return clone;
                  });
                }}
              >
                {speciality.name}
              </BookingSelectedFilter>
            ))}
          {!!options.disease?.length &&
            options.disease.map((disease) => (
              <BookingSelectedFilter
                key={disease._id}
                onClick={() =>
                  setOptions((prev) => {
                    const clone = { ...prev };
                    if (!clone.disease) return { ...clone, disease: [disease] };
                    const index = clone.disease.findIndex(
                      (el) => el._id === disease._id,
                    );
                    if (index === -1) {
                      clone.disease.push(disease);
                    } else {
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
                    if (!clone.service) return { ...clone, service: [service] };
                    const index = clone.service.findIndex(
                      (el) => el._id === service._id,
                    );
                    if (index === -1) {
                      clone.service.push(service);
                    } else {
                      clone.service.splice(index, 1);
                    }
                    return clone;
                  })
                }
              >
                {service.title}
              </BookingSelectedFilter>
            ))}
          {!!options.education?.length &&
            options.education.map((tier) => (
              <BookingSelectedFilter
                key={tier}
                onClick={() =>
                  setOptions((prev) => {
                    const clone = { ...prev };
                    if (!clone.education) return { ...clone, education: [] };
                    const index = clone.education.findIndex(
                      (el) => el === tier,
                    );
                    if (index === -1) {
                      clone.education.push(tier);
                    } else {
                      clone.education.splice(index, 1);
                    }
                    return clone;
                  })
                }
              >
                {getContent(tier)}
              </BookingSelectedFilter>
            ))}
          {!!options.gender && (
            <BookingSelectedFilter
              onClick={() => setOptions((prev) => ({ ...prev, gender: null }))}
            >
              {getContent(options.gender)}
            </BookingSelectedFilter>
          )}
          {!!options.date && (!!options.date.start || options.date.end) && (
            <BookingSelectedFilter
              onClick={() => setOptions((prev) => ({ ...prev, date: null }))}
            >
              {`${options.date.start ? dateToString({ value: options.date.start }) : getContent("unset")}-${options.date.end ? dateToString({ value: options.date.end }) : getContent("unset")}`}
            </BookingSelectedFilter>
          )}
          {!!options.time && (
            <BookingSelectedFilter
              onClick={() => setOptions((prev) => ({ ...prev, time: null }))}
            >
              {`${options.time.start ? numberToTime(options.time.start) : getContent("unset")}-${options.time.end ? numberToTime(options.time.end) : getContent("unset")}`}
            </BookingSelectedFilter>
          )}
          {!!options.onlyAvailable && (
            <BookingSelectedFilter
              onClick={() =>
                setOptions((prev) => ({ ...prev, onlyAvailable: false }))
              }
            >
              {getContent("onlyAvailable")}
            </BookingSelectedFilter>
          )}
          {!!options.ePresc && (
            <BookingSelectedFilter
              onClick={() => setOptions((prev) => ({ ...prev, ePresc: false }))}
            >
              {getContent("onlyWithEPresc")}
            </BookingSelectedFilter>
          )}
        </Fragment>
      }
      top={
        <Fragment>
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
          {/* TODO: Do this */}
          <MultiSelectInputServer
            value={options.clinic || []}
            placeholder={getContent("selectClinicsPlaceholder")}
            onChange={(e) => setOptions((prev) => ({ ...prev, clinic: e }))}
            getOption={(node) => ({ title: node.name || "", value: node._id })}
            path={`${API}/public/search/clinic`}
          />
        </Fragment>
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
          <BookingFilterSegment title={getContent("category")}>
            <BookingFilterButton
              title={getContent("specialityGroup")}
              active={!!options.speciality?.length}
            >
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
            </BookingFilterButton>
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
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, disease: e }))
                }
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
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, service: e }))
                }
              />
            </BookingFilterButton>
          </BookingFilterSegment>
          <BookingFilterSegment title={getContent("details")}>
            <BookingFilterButton
              title={getContent("educationLevel")}
              active={!!options.education?.length}
            >
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
            </BookingFilterButton>
            <BookingFilterButton
              title={getContent("gender")}
              active={!!options.gender}
            >
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
            </BookingFilterButton>
            <BookingFilterButton
              title={getContent("sessionDate")}
              active={!!options.date}
            >
              <div className={classes.date}>
                <span className={`${classes.inlineTitle} ${t2xsRegular}`}>
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
            </BookingFilterButton>
            <BookingFilterButton
              title={getContent("sessionTime")}
              active={!!options.time}
            >
              <div className={classes.date}>
                <span className={classes.inlineTitle}>
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
            </BookingFilterButton>
            <FilterButtonBool
              title={getContent("onlyAvailable")}
              active={!!options.onlyAvailable}
              onClick={() =>
                setOptions((prev) => ({
                  ...prev,
                  onlyAvailable: !prev.onlyAvailable,
                }))
              }
            />
            <FilterButtonBool
              title={getContent("onlyWithEPresc")}
              active={!!options.ePresc}
              onClick={() =>
                setOptions((prev) => ({ ...prev, ePresc: !prev.ePresc }))
              }
            />
          </BookingFilterSegment>
        </Fragment>
      }
    />
  );
};

export default DoctorBookingFilter;
