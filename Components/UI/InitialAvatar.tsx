import classes from "./InitialAvatar.module.css";

const TONES = ["g1", "g2", "g3", "g4", "g5", "g6"] as const;

// Round avatar with the first letter of a name on a gradient that stays
// the same for the same seed (patient id), so a person keeps their color.
const InitialAvatar = ({ name, seed, size = "2.5rem" }: { name: string; seed: string; size?: string }) => {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const letter = name.trim().charAt(0) || "?";
  return (
    <span
      className={`${classes.main} ${classes[TONES[h % TONES.length]]}`}
      style={{ width: size, height: size, fontSize: `calc(${size} * 0.42)` }}
      aria-hidden
    >
      {letter}
    </span>
  );
};

export default InitialAvatar;
