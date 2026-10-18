import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import SectionHeader from "../UI/SectionHeader";
import RowScroller from "../UI/RowScroller";
import classes from "./HomePopular.module.css";
import DoctorCardAlt from "../UI/DoctorCardAlt";

const NS: ContentNamespace[] = ["common", "home"];

const HomePopular = ({
  nodes,
}: {
  nodes?: IDoctorProfile<{ MainSpecialityPopulated: Record<never, never> }>[];
}) => {
  const getContent = useScopedLocale(NS);

  if (!nodes?.length) return null;
  return (
    <div className={classes.main}>
      <SectionHeader
        title={getContent("popularDoctors")}
        action={{ href: "/book", label: getContent("seeAll") }}
      />
      <RowScroller rows={1} itemWidth="14.75rem">
        {nodes.map((node) => (
          <li key={node._id} className={classes.slide}>
            <DoctorCardAlt node={node} />
          </li>
        ))}
      </RowScroller>
    </div>
  );
};

export default HomePopular;
