"use client";

import { useEffect, useRef } from "react";
import classes from "./CrmPublic.module.css";

// A drawn signature (pointer or touch), handed back as a small PNG data
// URL when the pen lifts; empty again on clear.
const SignaturePad = ({ onChange, clearLabel, label }: { onChange: (dataUrl: string) => void; clearLabel: string; label: string }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    c.width = c.clientWidth * ratio;
    c.height = c.clientHeight * ratio;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111";
  }, []);
  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  return (
    <div className={classes.sigBox}>
      <span>{label}</span>
      <canvas
        ref={ref}
        className={classes.sig}
        aria-label={label}
        onPointerDown={(e) => {
          const ctx = e.currentTarget.getContext("2d");
          if (!ctx) return;
          drawing.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          const p = pos(e);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const ctx = e.currentTarget.getContext("2d");
          const p = pos(e);
          ctx?.lineTo(p.x, p.y);
          ctx?.stroke();
        }}
        onPointerUp={(e) => {
          drawing.current = false;
          onChange(e.currentTarget.toDataURL("image/png"));
        }}
      />
      <button
        type="button"
        className={classes.ghost}
        onClick={() => {
          const c = ref.current;
          c?.getContext("2d")?.clearRect(0, 0, c.width, c.height);
          onChange("");
        }}
      >
        {clearLabel}
      </button>
    </div>
  );
};

export default SignaturePad;
