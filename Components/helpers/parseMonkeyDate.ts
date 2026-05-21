import moment from "moment-jalaali";
const parseMonkeyDate = (monkey: string) => {
  const m = moment(monkey, "jYYYYjMMjDD");
  return m.toDate();
};

export default parseMonkeyDate;
