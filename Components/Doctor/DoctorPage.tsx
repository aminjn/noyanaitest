"use client";

import Image from "next/image";
import { IDoctor } from "../Admin/Doctor/AdminManageDoctorsPage";

import classes from "./DoctorPage.module.css";
import { imagePath } from "../helpers/imagepath";
import useLocale from "../Hooks/useLocale";
import { PublicDrIntroInner } from "../Dr/PublicDrIntro";
import { DrIntroductionInner } from "../Dr/DrtIntroduction";
import { IDoctorFaq } from "../DoctorPanel/Profile/DoctorManageFaqTab";
import FaqList from "../UI/FaqList";

export type DoctorPageProps = {
  data: IDoctor<{
    SpecialityPopulated: Record<never, never>;
    Gallery: Record<never, never>;
  }>;
  faqs: IDoctorFaq[];
};

const DoctorPage = ({ data, faqs }: DoctorPageProps) => {
  return (
    <div>
      <PublicDrIntroInner
        name={data.name || ""}
        address={data.address}
        image={data.image}
        speciality={data.speciality}
      />
      <DrIntroductionInner
        name={data.name || ""}
        introduction={data.description}
        website={data.site}
        gallery={data.gallery
          ?.filter((el) => !!el.image)
          .map((el) => ({
            alt: el.alt || "",
            src: el.image || "",
          }))}
        socials={[
          { kind: "Instagram", target: data.instagram },
          { kind: "Telegarm", target: data.telegram },
          { kind: "Aparat", target: data.aparat },
        ]}
        landLine={data.landLine}
        mobile={data.mobile}
        coords={!!data.lat && !!data.lng ? [data.lng, data.lat] : undefined}
      />
      <FaqList items={faqs} />
    </div>
  );
};

export default DoctorPage;
