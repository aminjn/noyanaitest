import Button from "./Button";
import classes from "./OptionInput.module.css";
const OptionInput = ({
  options,
  onChange,
  value,
  title,
}: {
  value?: string;
  options: { title: string; value: string }[];
  onChange?: (e: string) => unknown;
  title?: string;
}) => {
  return (
    <div className={classes.main}>
      {!!title && <span className={classes.title}>{title}</span>}
      <div className={classes.options}>
        {options.map((opt) => (
          <Button
            key={opt.value}
            onClick={() => onChange?.(opt.value)}
            variant={value === opt.value ? "Primary" : "Neutral"}
          >
            {opt.title}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default OptionInput;
