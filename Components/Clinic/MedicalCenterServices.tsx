import useLocale from "../Hooks/useLocale";
import HeartIcon from "../Icons/HeartIcon";
import MedalIcon from "../Icons/MedalIcon";
import IconTitle from "../UI/IconTitle";
import Ixon from "../UI/Ixon";
import { tsmRegular } from "../UI/Typography";
import classes from "./MedicalCenterServices.module.css";
const MedicalCenterServices = ({ nodes }: { nodes: string[] }) => {
  const getContent = useLocale();

  if (!nodes.length) return null;
  return (
    <div className={classes.main} id="services">
      <IconTitle icon={<MedalIcon />}>
        {getContent("availableServices")}
      </IconTitle>
      <div className={classes.list}>
        {nodes.map((service, i) => (
          <div className={`${classes.item} ${tsmRegular}`} key={`service${i}`}>
            <Ixon className={classes.icon} width=".875rem">
              <HeartIcon />
            </Ixon>
            <span>{service}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicalCenterServices;
