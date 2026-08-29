import Image from "next/image";
import useLocale from "../Hooks/useLocale";
import Button from "../UI/Button";
import classes from "./AboutCta.module.css";
import img from "./aboutCta.png";
import { t2xlBold, tbaseRegular } from "../UI/Typography";

const AboutCta = () => {
  const getContent = useLocale();

  return (
    <div className={classes.main}>
      <div className={classes.circles}>
        <div className={classes.circleLeft} />
        <div className={classes.circleRight} />
      </div>
      <div className={classes.content}>
        <h2 className={`${classes.title} ${t2xlBold}`}>
          {getContent("aboutCtaTitle")}
        </h2>
        <p className={`${classes.legend} ${tbaseRegular}`}>
          {getContent("aboutCtaLegend")}
        </p>
        <div className={classes.actions}>
          <Button variant="Primary" mode="Outline" size="M" radius="High" className={classes.primaryAction} >
            {getContent("joinNoyanAi")}
          </Button>
          <Button
            className={classes.altBtn}
            variant="Primary"
            mode="Outline"
            href="/contact"
            size="M"
            radius="High"
          >
            {getContent("contactUs")}
          </Button>
        </div>
        <div className={classes.items}>
          <p className={classes.item}>{getContent("aboutCtaItem0")}</p>
          <p className={classes.item}>{getContent("aboutCtaItem1")}</p>
        </div>
      </div>
      <div className={classes.image}>
        <Image
          src={img}
          alt={getContent("aboutCtaImageAlt")}
          sizes="24rem"
          style={{ objectFit: "contain" }}
          fill
        />
      </div>
    </div>
  );
};

export default AboutCta;
