import classes from "./Bitches.module.css";
import bitch1 from "./1.jpg";
import bitch2 from "./2.jpg";
import bitch3 from "./3.jpg";
import bitch4 from "./4.jpg";
import bitch5 from "./5.jpg";
import bitch6 from "./6.jpg";
import Image from "next/image";

const bitches = [bitch1, bitch2, bitch3, bitch4, bitch5, bitch6];

const Bitches = () => {
  return (
    <div className={classes.bitches}>
      {bitches.map((bitch, index) => (
        <div key={index} className={classes.bitch}>
          <Image
            src={bitch}
            alt="Our Lovely User"
            fill
            style={{ objectFit: "cover" }}
            sizes="1rem"
          />
        </div>
      ))}
      <div className={classes.number}>50</div>
    </div>
  );
};

export default Bitches;
