import classes from "./ClinicIntro.module.css";
import { ClinicPageNode } from "./ClinicPage";
import WideIntro from "./WideIntro";
const ClinicIntro = ({ node }: { node: ClinicPageNode }) => {
  return (
    <WideIntro
      name={node.name}
      commentCount={450}
      score={4.9}
      category={node.category?.name}
      image={node.image}
      province={node.province?.name}
    />
  );
};

export default ClinicIntro;
