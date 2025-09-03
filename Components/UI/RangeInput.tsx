import { WithStyleProps } from "../Layout/Layout";
import classes from "./RangeInput.module.css";
import { Range } from "react-range";

const RangeInput = ({
  className = "",
  style,
  title,
  left,
  mark,
  max,
  min,
  right,
  step,
  thumb,
  onChange,
  values,
  readOnly,
}: WithStyleProps<{
  title?: string;
  min: number;
  max: number;
  step: number;
  thumb: (index: number) => string;
  left: number;
  right: number;
  mark?: (index: number) => string;
  values: number[];
  onChange: (e: number[]) => void;
  readOnly?: boolean;
}>) => {
  return (
    <div style={style} className={`${className} ${classes.range}`}>
      {!!title && <legend className={classes.title}>{title}</legend>}
      <div className={classes.rangeContainer}>
        <Range
          disabled={!!readOnly}
          draggableTrack
          min={min}
          max={max}
          values={values}
          onChange={onChange}
          step={step}
          renderThumb={(params) => (
            <div
              className={classes.thumb}
              {...params.props}
              key={params.props.key}
            >
              <div className={classes.thumbLabel}>{thumb(params.index)}</div>
            </div>
          )}
          renderTrack={(params) => (
            <div className={classes.track} {...params.props}>
              <div
                className={classes.fill}
                style={{
                  left: `${((left - min) / (max - min)) * 100}%`,
                  right: `${100 - ((right - min) / (max - min)) * 100}%`,
                }}
              />
              {params.children}
            </div>
          )}
          renderMark={
            mark
              ? (params) => (
                  <div
                    className={`${classes.mark} ${
                      params.index % 2 ? classes.oddMark : ""
                    } ${
                      !!(
                        params.index === 0 ||
                        params.index === (max - min) / step
                      )
                        ? classes.hideMark
                        : ""
                    }`}
                    {...params.props}
                    key={params.props.key}
                    style={{ ...params.props.style, marginTop: 0 }}
                  >
                    {!(params.index % 2) && (
                      <span className={classes.markLabel}>
                        {mark(params.index)}
                      </span>
                    )}
                  </div>
                )
              : undefined
          }
          allowOverlap
        />
      </div>
    </div>
  );
};

export default RangeInput;
