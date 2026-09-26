import { useState } from "react";
import classes from "./DailyBarChart.module.css";

export type DailyPoint = { date: string; count: number };

const dayLabel = new Intl.DateTimeFormat("fa-IR", {
  month: "short",
  day: "numeric",
});
const fullDayLabel = new Intl.DateTimeFormat("fa-IR", {
  weekday: "long",
  month: "long",
  day: "numeric",
});
const num = new Intl.NumberFormat("fa-IR");

// "YYYY-MM-DD" (Tehran day) -> Date at noon UTC, safe to format in any tz.
const toDate = (day: string) => new Date(`${day}T12:00:00Z`);

const niceMax = (value: number) => {
  if (value <= 4) return 4;
  const pow = Math.pow(10, Math.floor(Math.log10(value)));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * pow * 4 >= value) || 10;
  return step * pow * 4;
};

const W = 600;
const H = 200;
// y-axis on the right (the start side in RTL); newest day on the left.
const PAD = { top: 12, right: 36, bottom: 28, left: 8 };

// Single-series daily bar chart: one hue, recessive grid, hover tooltip,
// and a table view for screen readers / exact values.
const DailyBarChart = ({
  title,
  unit,
  points,
}: {
  title: string;
  unit: string;
  points: DailyPoint[];
}) => {
  const [hover, setHover] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  const total = points.reduce((sum, p) => sum + p.count, 0);
  const max = niceMax(Math.max(0, ...points.map((p) => p.count)));
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const slot = plotW / Math.max(points.length, 1);
  const barW = Math.max(2, slot - 4);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(max * t));
  const x = (i: number) => PAD.left + (points.length - 1 - i) * slot + (slot - barW) / 2;
  const y = (v: number) => PAD.top + plotH - (v / max) * plotH;

  const hovered = hover !== null ? points[hover] : null;

  return (
    <div className={classes.main}>
      <div className={classes.head}>
        <div>
          <h3 className={classes.title}>{title}</h3>
          <span className={classes.sub}>
            {`${num.format(total)} ${unit} در ${num.format(points.length)} روز اخیر`}
          </span>
        </div>
        <button
          type="button"
          className={classes.toggle}
          onClick={() => setShowTable((prev) => !prev)}
        >
          {showTable ? "نمودار" : "جدول"}
        </button>
      </div>

      {showTable ? (
        <div className={classes.tableWrap}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>روز</th>
                <th>{unit}</th>
              </tr>
            </thead>
            <tbody>
              {[...points].reverse().map((p) => (
                <tr key={p.date}>
                  <td>{fullDayLabel.format(toDate(p.date))}</td>
                  <td>{num.format(p.count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={classes.chart} onMouseLeave={() => setHover(null)}>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={`${title}: مجموع ${num.format(total)} ${unit}`}
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
                <text x={W - PAD.right + 8} y={y(t) + 4} className={classes.axis} textAnchor="start">
                  {num.format(t)}
                </text>
              </g>
            ))}
            {points.map((p, i) => {
              const h = (p.count / max) * plotH;
              const r = Math.min(4, barW / 2, h);
              const bx = x(i);
              const by = y(p.count);
              return (
                <g key={p.date}>
                  {p.count > 0 && (
                    <path
                      className={`${classes.bar} ${hover === i ? classes.barHover : ""}`}
                      d={`M${bx},${by + h} V${by + r} Q${bx},${by} ${bx + r},${by} H${bx + barW - r} Q${bx + barW},${by} ${bx + barW},${by + r} V${by + h} Z`}
                    />
                  )}
                  {/* hit target larger than the mark */}
                  <rect
                    x={PAD.left + (points.length - 1 - i) * slot}
                    y={PAD.top}
                    width={slot}
                    height={plotH}
                    fill="transparent"
                    onMouseEnter={() => setHover(i)}
                  />
                  {i % 5 === (points.length - 1) % 5 && (
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
                top: `${(y(hovered.count) / H) * 100}%`,
              }}
            >
              <span className={classes.tooltipDay}>
                {fullDayLabel.format(toDate(hovered.date))}
              </span>
              <strong>{`${num.format(hovered.count)} ${unit}`}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyBarChart;
