import classes from "./AiOrb.module.css";
import SparkIcon from "../Icons/SparkIcon";

// The assistant's avatar: a slowly turning gradient orb with a spark.
const AiOrb = ({ size = "3.5rem", className = "" }: { size?: string; className?: string }) => (
  <span className={`${classes.orb} ${className}`} style={{ width: size, height: size }} aria-hidden>
    <span className={classes.spin} />
    <span className={classes.shine} />
    <span className={classes.icon}>
      <SparkIcon />
    </span>
  </span>
);

export default AiOrb;
