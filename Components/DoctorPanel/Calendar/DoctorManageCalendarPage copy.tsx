// "use client";

// import classes from "./DoctorManageCalendarPage.module.css";
// import WithBalanceHeader from "../_UI/WithBalanceHeader";
// import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
// import Calendxr, { CalendxrView } from "@/Components/UI/Calendar/Calendxr";
// import DoctorCalendarDay from "./DoctorCalendarDay";
// import Ixon from "@/Components/UI/Ixon";
// import ChevronIcon from "@/Components/Icons/ChevronIcon";
// import useLocale from "@/Components/Hooks/useLocale";
// import {
//   fromJalali,
//   jalaliMonthWeekdays,
//   PERSIAN_MONTHS,
//   toJalali,
//   weekdayOfJalali,
// } from "@/Components/UI/Calendar/CalendxrLib";
// import DropDown from "@/Components/UI/DropDown";
// import { range } from "@/Components/helpers/lib";
// import moment, { jDaysInMonth } from "moment-jalaali";
// import CheckIcon from "@/Components/Icons/CheckIcon";
// import MinusIcon from "@/Components/Icons/MinusIcon";
// import AddSessionsAgent from "./AddSessionsAgent";
// import Loading from "@/Components/Admin/UI/Loading";

// const weekDays = [
//   "شنبه",
//   "یکشنبه",
//   "دوشنبه",
//   "سه‌شنبه",
//   "چهارشنبه",
//   "پنج‌شنبه",
//   "جمعه",
// ];

// const WeekDay = ({
//   index,
//   selected,
//   setSelected,
//   view,
// }: {
//   index: number;
//   view: CalendxrView;
//   selected: Date[];
//   setSelected: Dispatch<SetStateAction<Date[]>>;
// }) => {
//   const status = useMemo<"Full" | "None" | "Partial">(() => {
//     const { jy, jm } = view;
//     const applicable = selected.filter(
//       (d) =>
//         moment(d)
//           .startOf("day")
//           .isBetween(
//             moment(fromJalali(jy, jm, 1)).startOf("day").subtract(1, "ms"),
//             moment(fromJalali(jy, jm, jDaysInMonth(jy, jm - 1))).endOf("day")
//           ) &&
//         (weekdayOfJalali(toJalali(d).jy, toJalali(d).jm, toJalali(d).jd) + 1) %
//           7 ===
//           index
//     );
//     if (!applicable.length) return "None";
//     const all = jalaliMonthWeekdays(view.jy, view.jm, index).filter(
//       (el) => el !== 1
//     );
//     if (applicable.length === all.length) return "Full";
//     return "Partial";
//   }, [selected, view, index]);

//   return (
//     <button
//       onClick={() => {
//         setSelected((prev) => {
//           const { jy, jm } = view;
//           let clone = [...prev];
//           if (status === "None") {
//             const all = jalaliMonthWeekdays(view.jy, view.jm, index).filter(
//               (el) => el !== 1
//             );
//             const now = new Date();
//             for (let i = 0; i < all.length; ++i) {
//               const then = moment(`${jy}/${jm}/${all[i] - 1}`, "jYYYY/jM/jD")
//                 .startOf("day")
//                 .toDate();
//               if (then < now) continue;
//               clone.push(then);
//             }
//           } else {
//             clone = clone.filter(
//               (d) =>
//                 !(
//                   moment(d)
//                     .startOf("day")
//                     .isBetween(
//                       moment(fromJalali(jy, jm, 1)).startOf("day").add(1, "ms"),
//                       moment(
//                         fromJalali(jy, jm, jDaysInMonth(jy, jm - 1))
//                       ).endOf("day")
//                     ) &&
//                   (weekdayOfJalali(
//                     toJalali(d).jy,
//                     toJalali(d).jm,
//                     toJalali(d).jd
//                   ) +
//                     1) %
//                     7 ===
//                     index
//                 )
//             );
//           }
//           return clone;
//         });
//       }}
//       className={`${classes.weekDay}`}
//     >
//       <span className={classes.check}>
//         {status === "None" ? (
//           <span className={classes.empty} />
//         ) : (
//           <Ixon>{status === "Full" ? <CheckIcon /> : <MinusIcon />}</Ixon>
//         )}
//       </span>
//       <span>{weekDays[index]}</span>
//     </button>
//   );
// };

// const DoctorManageCalendarPage = () => {
//   const [selected, setSelected] = useState<Date[]>([]);

//   const getContent = useLocale();

//   const [shouldShow, setShouldShow] = useState<boolean>(true);

//   useEffect(() => {
//     if (!shouldShow) setShouldShow(true);
//   }, [shouldShow]);

//   if (!shouldShow) return <Loading />;
//   return (
//     <WithBalanceHeader>
//       <div className={`${classes.calendar}`}>
//         <div className={classes.header}>
//           <legend>تقویم</legend>
//         </div>
//         <Calendxr
//           selectionMode="multiple"
//           value={selected}
//           onChange={(e) => {
//             if (Array.isArray(e)) setSelected(e);
//           }}
//           renderDay={({ date, selected, onSelect }) => (
//             <DoctorCalendarDay
//               stamp={date}
//               selected={selected}
//               onSelect={onSelect}
//             />
//           )}
//           classNames={{
//             daysGrid: classes.days,
//             container: classes.container,
//             weekdays: classes.weekDays,
//           }}
//           renderHeader={({ goNextMonth, goPrevMonth, jm, jy, setView }) => (
//             <div className={classes.header}>
//               <button
//                 type="button"
//                 onClick={goPrevMonth}
//                 className={classes.moveMonth}
//               >
//                 <Ixon width=".875rem" style={{ transform: `rotateZ(-90deg)` }}>
//                   <ChevronIcon />
//                 </Ixon>
//                 <span>{getContent("prevMonth")}</span>
//               </button>
//               <div className={classes.view}>
//                 <DropDown
//                   className={classes.month}
//                   options={PERSIAN_MONTHS.reduce(
//                     (acc, el, i) => ({ ...acc, [i.toString()]: el }),
//                     {}
//                   )}
//                   value={(jm - 1).toString()}
//                   onChange={(jm) =>
//                     setView((prev) => ({ ...prev, jm: Number(jm) + 1 }))
//                   }
//                 />
//                 <DropDown
//                   className={classes.month}
//                   options={range(1, 2000).reduce(
//                     (acc, el) => ({ ...acc, [el.toString()]: el }),
//                     {}
//                   )}
//                   value={jy.toString()}
//                   onChange={(jy) =>
//                     setView((prev) => ({ ...prev, jy: Number(jy) }))
//                   }
//                 />
//               </div>
//               <button
//                 type="button"
//                 onClick={goNextMonth}
//                 className={classes.moveMonth}
//               >
//                 <span>{getContent("nextMonth")}</span>
//                 <Ixon width=".875rem" style={{ transform: `rotateZ(90deg)` }}>
//                   <ChevronIcon />
//                 </Ixon>
//               </button>
//             </div>
//           )}
//           renderWeekDay={(index, view) => (
//             <WeekDay
//               index={index}
//               view={view}
//               selected={selected}
//               setSelected={setSelected}
//             />
//           )}
//         />
//         <AddSessionsAgent
//           selected={selected}
//           setSelected={setSelected}
//           mutate={() => setShouldShow(false)}
//         />
//       </div>
//     </WithBalanceHeader>
//   );
// };

// export default DoctorManageCalendarPage;
