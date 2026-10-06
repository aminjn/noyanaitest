import { TEHRAN_TZ } from "@/Components/helpers/tehranTime";
import { useMemo } from "react";
import classes from "./HomeHeroVisual.module.css";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { useIntlLocale } from "@/Components/i18n/navigation";
import Ixon from "../UI/Ixon";
import SparkIcon from "../Icons/SparkIcon";
import CheckCircleIcon from "../Icons/CheckCircleIcon";
import PillIcon from "../Icons/PillIcon";
import Calendar02Icon from "../Icons/Calendar02Icon";
import ShieldCheckIcon from "../Icons/ShieldCheckIcon";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import LogoLong from "../UI/LogoLong";

const NS: ContentNamespace[] = ["common", "home"];

// A composed product mock instead of a photo: a frosted phone with the AI
// assistant routing a symptom to a specialty and open slots, plus floating
// cards for the confirmed booking and the e-prescription. Pure HTML/CSS (no
// image request, nothing for the LCP to wait on); decorative, so hidden
// from assistive tech. It shows no made-up numbers or probabilities: the
// assistant suggests a specialty and an urgency level, never a diagnosis.
const HomeHeroVisual = () => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();

  const { slots, booked } = useMemo(() => {
    const time = new Intl.DateTimeFormat(intlTag, {
      timeZone: TEHRAN_TZ,
      hour: "numeric",
      minute: "2-digit",
    });
    const weekday = new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, weekday: "long" });
    // any fixed day/times: this is an illustration
    const at = (h: number, m: number) => time.format(new Date(2026, 0, 3, h, m));
    return {
      slots: [at(9, 0), at(10, 30), at(16, 0)],
      booked: `${weekday.format(new Date(2026, 0, 3))} · ${at(10, 30)}`,
    };
  }, [intlTag]);

  return (
    <div className={classes.stage} aria-hidden="true">
      <div className={classes.glow} />
      <div className={classes.ring} />

      <div className={classes.phone}>
        <div className={classes.notch} />
        <div className={classes.screen}>
          <div className={classes.appBar}>
            <LogoLong width={82} height={28} />
            <span className={classes.appDot} />
          </div>

          <div className={classes.chat}>
            <div className={`${classes.bubble} ${classes.user}`}>
              {getContent("heroMockUser")}
            </div>
            <div className={`${classes.bubble} ${classes.ai}`}>
              <span className={classes.aiHead}>
                <span className={`${classes.aiOrb} glassIcon tone-violet`}>
                  <Ixon width="0.75rem">
                    <SparkIcon />
                  </Ixon>
                </span>
                {getContent("heroMockAiLabel")}
              </span>
              <span className={classes.aiSpecialty}>
                <Ixon width="1rem">
                  <StetoscopeIcon />
                </Ixon>
                {getContent("heroMockDoctor")}
              </span>
              <span className={classes.urgency}>
                {getContent("heroMockUrgency")}
              </span>
            </div>
          </div>

          <div className={classes.slotsCard}>
            <span className={classes.slotsTitle}>
              <Ixon width="0.875rem">
                <Calendar02Icon />
              </Ixon>
              {getContent("heroMockSlots")}
            </span>
            <div className={classes.slots}>
              {slots.map((slot, i) => (
                <span
                  key={slot}
                  className={`${classes.slot} ${i === 1 ? classes.slotOn : ""}`}
                >
                  {slot}
                </span>
              ))}
            </div>
          </div>

          <div className={classes.tabBar}>
            <span className={`${classes.tabOn} glassIcon`}>
              <Ixon width="1rem">
                <SparkIcon />
              </Ixon>
            </span>
            <span>
              <Ixon width="1rem">
                <Calendar02Icon />
              </Ixon>
            </span>
            <span>
              <Ixon width="1rem">
                <PillIcon />
              </Ixon>
            </span>
            <span>
              <Ixon width="1rem">
                <StetoscopeIcon />
              </Ixon>
            </span>
          </div>
        </div>
      </div>

      <div className={`${classes.float} ${classes.floatBooked}`}>
        <span className={`${classes.floatIcon} tone-teal`}>
          <Ixon width="1.125rem">
            <CheckCircleIcon />
          </Ixon>
        </span>
        <span className={classes.floatText}>
          <span className={classes.floatTitle}>
            {getContent("heroMockBooked")}
          </span>
          <span className={classes.floatSub}>{booked}</span>
        </span>
      </div>

      <div className={`${classes.float} ${classes.floatRx}`}>
        <span className={`${classes.floatIcon} tone-violet`}>
          <Ixon width="1.125rem">
            <PillIcon />
          </Ixon>
        </span>
        <span className={classes.floatText}>
          <span className={classes.floatTitle}>{getContent("heroMockRx")}</span>
          <span className={classes.floatSub}>{getContent("heroMockRxSub")}</span>
        </span>
      </div>

      <div className={`${classes.float} ${classes.floatSafe}`}>
        <span className={`${classes.floatIcon} tone-indigo`}>
          <Ixon width="1rem">
            <ShieldCheckIcon />
          </Ixon>
        </span>
        <span className={classes.floatTitle}>{getContent("heroMockVerified")}</span>
      </div>
    </div>
  );
};

export default HomeHeroVisual;
