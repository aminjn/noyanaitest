import classes from "./DoctorGallery.module.css";
import HostedImage from "../UI/HostedImage";
import { useState } from "react";

export type GalleryItems = { src: string; alt: string }[];

const DoctorGallery = ({ items }: { items: GalleryItems }) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  return (
    <div className={classes.container}>
      <ul className={classes.main}>
        {items.map((item, i) => (
          <li
            key={item.src}
            className={classes.image}
            style={{
              transform: `translateY(-50%) translateX(-100%) translateX(-2rem) translateX(${
                (i - currentSlide) * 100
              }%) scale(${
                currentSlide === i ? "1.5" : "calc(1 / 1.5)"
              }) translateX(${
                currentSlide - i === -1 ? "5rem" : 0
              }) translateX(${currentSlide - i === 1 ? "-5rem" : 0})`,
              opacity: currentSlide === i ? 1 : 0.3,
            }}
            onClick={() => setCurrentSlide(i)}
          >
            <HostedImage
              alt={item.alt}
              src={item.src}
              fill
              style={{ objectFit: "cover" }}
              sizes="50dvw"
            />
          </li>
        ))}
      </ul>
      <nav className={classes.nav}>
        {items.map((item, i) => (
          <button
            key={item.src}
            title={`slide ${i}`}
            className={`${classes.navButton} ${
              i === currentSlide ? classes.activeNav : ""
            }`}
            onClick={() => setCurrentSlide(i)}
          />
        ))}
      </nav>
    </div>
  );
};

export default DoctorGallery;
