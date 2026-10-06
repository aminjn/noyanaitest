"use client";
import { TEHRAN_TZ } from "@/Components/helpers/tehranTime";

import { useEffect, useMemo, useRef, useState } from "react";
import classes from "./DailyBarChart.module.css";

export type DailyPoint = { date: string; value: number };

export type DailyBarChartLabels = {
  // e.g. "۳۴ سفارش در ۳۰ روز اخیر" - already formatted by the caller
  summary: string;
  chart: string;
  table: string;
  day: string;
  value: string;
};

// "YYYY-MM-DD" (Tehran day) -> Date at noon UTC, safe to format in any tz.
const toDate = (day: string) => new Date(`${day}T12:00:00Z`);

// Smallest "nice" axis top (4 equal steps of 1/2/2.5|3/5 x 10^n) >= value.
const niceMax = (value: number) => {
  if (value <= 4) return 4;
  const pow = Math.pow(10, Math.floor(Math.log10(value / 4)));
  // 2.5 only once it still gives whole-number ticks
  const steps = pow >= 10 ? [1, 2, 2.5, 5, 10] : [1, 2, 3, 5, 10];
  const step = steps.find((s) => s * pow * 4 >= value) || 10;
  return step * pow * 4;
};

const H = 200;
const AXIS = 44;

// Single-series daily bar chart: one hue, recessive grid, hover tooltip and
// a table view for screen readers / exact values. The value axis sits on the
// reading-start side and the newest day on the reading-end side, so it reads
// naturally in both RTL and LTR. Two measures of different scale (e.g.
// orders and revenue) get two charts, never a dual axis.
const DailyBarChart = ({
  title,
  points,
  labels,
  locale,
  rtl,
  formatValue,
}: {
  title: string;
  points: DailyPoint[];
  labels: DailyBarChartLabels;
  locale: string;
  rtl: boolean;
  // tooltip / table value, e.g. "۱۲۰٬۰۰۰ تومان"
  formatValue?: (value: number) => string;
}) => {
  const [hover, setHover] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  // viewBox width follows the rendered width, so 1 unit = 1px and axis text
  // stays its real size at any screen width.
  const chartRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(600);
  useEffect(() => {
    const el = chartRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) =>
      setW(Math.max(280, Math.round(entry.contentRect.width))),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [showTable]);

  const { num, compact, dayLabel, fullDayLabel } = useMemo(
    () => ({
      num: new Intl.NumberFormat(locale),
      compact: new Intl.NumberFormat(locale, { notation: "compact" }),
      dayLabel: new Intl.DateTimeFormat(locale, { timeZone: TEHRAN_TZ, month: "short", day: "numeric" }),
      fullDayLabel: new Intl.DateTimeFormat(locale, {
        timeZone: TEHRAN_TZ,
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    }),
    [locale],
  );
  const format = formatValue || ((value: number) => num.format(value));

  const safe = (Array.isArray(points) ? points : []).map((p) => ({
    date: String(p?.date || ""),
    value: Number(p?.value) || 0,
  }));
  const PAD = {
    top: 12,
    bottom: 28,
    right: rtl ? AXIS : 8,
    left: rtl ? 8 : AXIS,
  };
  const max = niceMax(Math.max(0, ...safe.map((p) => p.value)));
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const slot = plotW / Math.max(safe.length, 1);
  const barW = Math.max(2, slot - 4);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(max * t));
  // oldest -> newest runs in reading direction
  const slotX = (i: number) =>
    PAD.left + (rtl ? safe.length - 1 - i : i) * slot;
  const x = (i: number) => slotX(i) + (slot - barW) / 2;
  const y = (v: number) => PAD.top + plotH - (v / max) * plotH;

  const hovered = hover !== null ? safe[hover] : null;
  // roughly one day label per 70px
  const labelEvery = Math.max(1, Math.ceil(safe.length / Math.max(1, Math.floor(plotW / 70))));

  return (
    <div className={classes.main}>
      <div className={classes.head}>
        <div>
          <h3 className={classes.title}>{title}</h3>
          <span className={classes.sub}>{labels.summary}</span>
        </div>
        <button
          type="button"
          className={classes.toggle}
          onClick={() => setShowTable((prev) => !prev)}
        >
          {showTable ? labels.chart : labels.table}
        </button>
      </div>

      {showTable ? (
        <div className={classes.tableWrap}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>{labels.day}</th>
                <th>{labels.value}</th>
              </tr>
            </thead>
            <tbody>
              {[...safe].reverse().map((p) => (
                <tr key={p.date}>
                  <td>{fullDayLabel.format(toDate(p.date))}</td>
                  <td>{format(p.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          ref={chartRef}
          className={classes.chart}
          onMouseLeave={() => setHover(null)}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={`${title}: ${labels.summary}`}
            className={classes.svg}
          >
            {ticks.map((t) => (
              <g key={t}>
                <line
                  x1={PAD.left}
                  x2={W - PAD.right}
                  y1={y(t)}
                  y2={y(t)}
                  className={t === 0 ? classes.baseline : classes.grid}
                />
                <text
                  x={rtl ? W - PAD.right + 8 : PAD.left - 8}
                  y={y(t) + 4}
                  className={classes.axis}
                  textAnchor={rtl ? "start" : "end"}
                >
                  {compact.format(t)}
                </text>
              </g>
            ))}
            {safe.map((p, i) => {
              const h = (p.value / max) * plotH;
              const r = Math.min(4, barW / 2, h);
              const bx = x(i);
              const by = y(p.value);
              return (
                <g key={p.date || i}>
                  {p.value > 0 && (
                    <path
                      className={`${classes.bar} ${hover === i ? classes.barHover : ""}`}
                      d={`M${bx},${by + h} V${by + r} Q${bx},${by} ${bx + r},${by} H${bx + barW - r} Q${bx + barW},${by} ${bx + barW},${by + r} V${by + h} Z`}
                    />
                  )}
                  {/* hit target larger than the mark */}
                  <rect
                    x={slotX(i)}
                    y={PAD.top}
                    width={slot}
                    height={plotH}
                    fill="transparent"
                    onMouseEnter={() => setHover(i)}
                    onTouchStart={() => setHover(i)}
                  />
                  {i % labelEvery === (safe.length - 1) % labelEvery && p.date && (
                    <text
                      x={bx + barW / 2}
                      y={H - 8}
                      className={classes.axis}
                      textAnchor="middle"
                    >
                      {dayLabel.format(toDate(p.date))}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          {hovered && hover !== null && (
            <div
              className={classes.tooltip}
              style={{
                left: `${((x(hover) + barW / 2) / W) * 100}%`,
                top: `${(y(hovered.value) / H) * 100}%`,
              }}
            >
              <span className={classes.tooltipDay}>
                {fullDayLabel.format(toDate(hovered.date))}
              </span>
              <strong>{format(hovered.value)}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyBarChart;
