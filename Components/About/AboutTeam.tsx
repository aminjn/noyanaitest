import HostedImage from "../UI/HostedImage";
import { IAboutTeam } from "../Admin/AboutTeam/AdminManageAboutTeamsPage";
import classes from "./AboutTeam.module.css";
import TitleLegend from "./TitleLegend";
import LinkedinIcon from "../Icons/LinkedinIcon";
import Ixon from "../UI/Ixon";
import { tmdBold, tsmBold, tsmRegular } from "../UI/Typography";
const AboutTeam = ({ team }: { team: IAboutTeam[] }) => {
  if (!Array.isArray(team) || !team.length) return null;
  return (
    <div className={classes.main}>
      <TitleLegend title="noyanTeamTitle" legend="noyanTeamLegend" />
      <ul className={classes.list}>
        {team.map((member) => (
          <li key={member._id} className={classes.item}>
            <div className={classes.image}>
              <HostedImage
                src={member.avatar}
                alt={member.name || ""}
                sizes="5rem"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
            <h3 className={`${classes.name} ${tmdBold}`}>{member.name}</h3>
            <legend className={`${classes.title} ${tsmBold}`}>
              {member.title}
            </legend>
            <p className={`${classes.description} ${tsmRegular}`}>
              {member.description}
            </p>
            {!!member.linkedin && (
              <a
                target="_blank"
                rel="noopener noreferrer"
                className={classes.linkedin}
                href={member.linkedin}
                aria-label="LinkedIn"
              >
                <Ixon width="1.25rem">
                  <LinkedinIcon />
                </Ixon>
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AboutTeam;
