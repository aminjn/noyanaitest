import classes from "./ClinicIntro.module.css";
import { ClinicPageNode } from "./ClinicPage";
import WideIntro from "./WideIntro";
const ClinicIntro = ({ node }: { node: ClinicPageNode }) => {
  return (
    <WideIntro
      name={node.name}
      commentCount={node.commentCount}
      score={node.averageScore}
      category={node.category?.name}
      image={node.image}
      province={node.province?.name}
      openStatus={node.openStatus}
    />
  );
};

export default ClinicIntro;
