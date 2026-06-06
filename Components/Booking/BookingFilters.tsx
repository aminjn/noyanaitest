import {
  Dispatch,
  Fragment,
  ReactNode,
  SetStateAction,
  useCallback,
  useState,
} from "react";
import classes from "./BookingFilters.module.css";
import {
  bookingNodes,
  bookingNodesContentKeyDict,
  BookingOptions,
} from "./BookingPage2";
import useLocale from "../Hooks/useLocale";
import { doctorSessionTypes } from "../DoctorPanel/Calendar/DoctorCalendarDay";
import MultiSelectInput from "../UI/MultiSelectInput";
import Button from "../UI/Button";
import XMarkIcon from "../Icons/XMarkIcon";
import { dateToString } from "../UI/FormatDate";
import { numberToTime } from "../DoctorPanel/Calendar/AddSessionsAgent";
import Ixon from "../UI/Ixon";
import ChevronIcon from "../Icons/ChevronIcon";
import ToggleInput from "../UI/ToggleInput";
import { t2xsRegular, tmdMedium, txsRegular } from "../UI/Typography";
import MultiSelectInputServer from "../UI/MultiSelectInputServer";
import { IClinic } from "../Admin/Clinic/AdminManageClinicsPage";
import { API } from "../config";
import { doctorProfileTiers, genders } from "../DoctorPanel/DoctorPanelPage";
import DateInput from "../UI/DateInput";
import InlineDateInput from "../UI/InlineDateInput";
import TimePicker from "../UI/TimePicker";

const SelectedFilter = ({
  onClick,
  children,
}: {
  children?: ReactNode;
  onClick: () => unknown;
}) => {
  return (
    <Button
      variant="Neutral"
      mode="Inline"
      size="S"
      radius="High"
      type="button"
      tailIcon={<XMarkIcon />}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

const Segment = ({
  title,
  action,
  children,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) => {
  return (
    <div className={classes.segment}>
      <span className={classes.segmentHeader}>
        <span className={`${classes.segmentTitle} ${t2xsRegular}`}>
          {title}
        </span>
        {action}
      </span>
      <div className={classes.segmentContent}>{children}</div>
    </div>
  );
};

const FilterButton = ({
  active,
  title,
  children,
}: {
  title: string;
  active: boolean;
  children?: ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className={classes.filterButtonContainer}>
      <button
        type="button"
        className={classes.filterButton}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className={`${classes.filterButtonTitle} ${txsRegular}`}>
          {title}
        </span>
        {!active && <span className={classes.activeBadge} />}
        <Ixon
          className={classes.filterButtonChevron}
          width="1rem"
          style={{ transform: isOpen ? "rotateZ(0)" : "rotateZ(90deg)" }}
        >
          <ChevronIcon />
        </Ixon>
      </button>
      {isOpen && <div className={classes.filterButtonContent}>{children}</div>}
    </div>
  );
};

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

const BookingFilter = ({
  options,
  setOptions,
}: {
  options: BookingOptions;
  setOptions: Dispatch<SetStateAction<BookingOptions>>;
}) => {
  const getContent = useLocale();

  return (
    <div className={classes.main}>
      <div className={classes.top}>
        <div className={classes.nodes}>
          <button
            type="button"
            onClick={() => setOptions((prev) => ({ ...prev, node: null }))}
            className={`${classes.node} ${!options.node ? classes.activeNode : ""} ${txsRegular}`}
          >
            {getContent("all")}
          </button>
          {bookingNodes.map((node) => (
            <button
              key={node}
              onClick={() => setOptions((prev) => ({ ...prev, node }))}
              className={`${classes.node} ${options.node === node ? classes.activeNode : ""} ${txsRegular}`}
              type="button"
            >
              {getContent(bookingNodesContentKeyDict[node])}
            </button>
          ))}
        </div>
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
      </div>
      <div className={classes.bot}>
        <div className={classes.botHeader}>
          <span className={`${classes.botTitle} ${tmdMedium}`}>
            {getContent("filters")}
          </span>
          <Button variant="Error" mode="Inline" size="S" radius="High">
            {getContent("deleteAll")}
          </Button>
        </div>
        <div className={classes.activeFilters}>
          {!!options.location && (
            <SelectedFilter
              onClick={() =>
                setOptions((prev) => ({ ...prev, location: null }))
              }
            >
              {`${options.location.min.lat}/${options.location.min.lng} :: ${options.location.max.lat}/${options.location.max.lng}`}
            </SelectedFilter>
          )}
          {!!options.district?.length && (
            <Fragment>
              {options.district.map((d) => (
                <SelectedFilter
                  key={d}
                  onClick={() =>
                    setOptions((prev) => {
                      const clone = { ...prev };
                      if (!clone.district) return { ...clone, district: [d] };
                      const index = clone.district.findIndex((el) => el === d);
                      if (index === -1) {
                        clone.district.push(d);
                      } else {
                        clone.district.splice(index, 1);
                      }
                      return clone;
                    })
                  }
                >
                  {options.district}
                </SelectedFilter>
              ))}
            </Fragment>
          )}
          {!!options.speciality?.length &&
            options.speciality.map((speciality) => (
              <SelectedFilter
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
              </SelectedFilter>
            ))}
          {!!options.disease?.length &&
            options.disease.map((disease) => (
              <SelectedFilter
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
              </SelectedFilter>
            ))}
          {!!options.service?.length &&
            options.service.map((service) => (
              <SelectedFilter
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
              </SelectedFilter>
            ))}
          {!!options.education?.length &&
            options.education.map((tier) => (
              <SelectedFilter
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
              </SelectedFilter>
            ))}
          {!!options.gender && (
            <SelectedFilter
              onClick={() => setOptions((prev) => ({ ...prev, gender: null }))}
            >
              {getContent(options.gender)}
            </SelectedFilter>
          )}
          {!!options.date && (!!options.date.start || options.date.end) && (
            <SelectedFilter
              onClick={() => setOptions((prev) => ({ ...prev, date: null }))}
            >
              {`${options.date.start ? dateToString({ value: options.date.start }) : getContent("unset")}-${options.date.end ? dateToString({ value: options.date.end }) : getContent("unset")}`}
            </SelectedFilter>
          )}
          {!!options.time && (
            <SelectedFilter
              onClick={() => setOptions((prev) => ({ ...prev, time: null }))}
            >
              {`${options.time.start ? numberToTime(options.time.start) : getContent("unset")}-${options.time.end ? numberToTime(options.time.end) : getContent("unset")}`}
            </SelectedFilter>
          )}
          {!!options.onlyAvailable && (
            <SelectedFilter
              onClick={() =>
                setOptions((prev) => ({ ...prev, onlyAvailable: false }))
              }
            >
              {getContent("onlyAvailable")}
            </SelectedFilter>
          )}
          {!!options.ePresc && (
            <SelectedFilter
              onClick={() => setOptions((prev) => ({ ...prev, ePresc: false }))}
            >
              {getContent("onlyWithEPresc")}
            </SelectedFilter>
          )}
        </div>
        <Segment
          title={getContent("geospetialPositoin")}
          action={
            <Button size="S" radius="High" variant="Secondary" mode="Inline">
              {getContent("selectOnMap")}
            </Button>
          }
        >
          <FilterButton
            title={getContent("district")}
            active={!!options.district}
          >
            <Fragment>
              <MultiSelectInput
                placeholder={getContent("selectDistrict")}
                options={[
                  { title: "قلعه حسن خان", value: "قلعه حسن خان" },
                  { title: "دروازه غار", value: "دروازه غار" },
                  { title: "فلاح", value: "فلاح" },
                ]}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, district: e }))
                }
                value={options.district || []}
              />
            </Fragment>
          </FilterButton>
        </Segment>
        <Segment title={getContent("category")}>
          <FilterButton
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
          </FilterButton>
          <FilterButton
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
          </FilterButton>
          <FilterButton
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
          </FilterButton>
        </Segment>
        <Segment title={getContent("details")}>
          <FilterButton
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
                  education: doctorProfileTiers.filter((el) => e.includes(el)),
                }))
              }
            />
          </FilterButton>
          <FilterButton title={getContent("gender")} active={!!options.gender}>
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
          </FilterButton>
          <FilterButton
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
          </FilterButton>
          <FilterButton
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
          </FilterButton>
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
        </Segment>
      </div>
    </div>
  );
};

export default BookingFilter;
