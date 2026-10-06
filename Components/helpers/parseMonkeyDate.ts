import moment from "moment-jalaali";
import { tehranNoon } from "./tehranTime";

// A Tamin date ("jYYYYjMMjDD") as that Tehran day's noon, so it shows as
// the same day in any time zone (Components/helpers/tehranTime.ts)
const parseMonkeyDate = (monkey: string) => {
  const m = moment.utc(monkey, "jYYYYjMMjDD");
  return m.isValid() ? tehranNoon(m.format("YYYY-MM-DD")) : new Date(NaN);
};

export default parseMonkeyDate;
