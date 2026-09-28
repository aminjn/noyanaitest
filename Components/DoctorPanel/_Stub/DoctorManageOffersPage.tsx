"use client";

import ComingSoon from "./ComingSoon";
import MedalStarIcon from "@/Components/Icons/MedalStarIcon";

const DoctorManageOffers = () => (
  <ComingSoon
    title="offers"
    target="/doctorpanel/offer"
    text="csOffers"
    icon={<MedalStarIcon />}
    cta={{ label: "csToPackages", href: "/doctorpanel/servicepackage" }}
  />
);

export default DoctorManageOffers;
