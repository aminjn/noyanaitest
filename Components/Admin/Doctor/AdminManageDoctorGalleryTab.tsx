// Gallery item types (Models/GalleryItem.ts in the backend), shared by the
// doctor panel gallery. The admin gallery tab of the retired legacy `Doctor`
// record page was removed with that page (2026-09).
import { MongoDoc } from "@/Components/Hooks/useUser";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import { IDoctor } from "./AdminManageDoctorsPage";

export type GalleryItemPopulation = { OwnerPopulated?: true };

export interface IGalleryItem<
  TOwnerIsDoctor extends boolean | undefined = boolean | undefined,
  TPopulation extends GalleryItemPopulation = GalleryItemPopulation,
> extends MongoDoc {
  owner: TOwnerIsDoctor extends undefined
    ? unknown
    : TPopulation["OwnerPopulated"] extends true
      ? TOwnerIsDoctor extends true
        ? IDoctor
        : IDoctorProfile
      : string;
  ownerPath: TOwnerIsDoctor extends undefined
    ? unknown
    : TOwnerIsDoctor extends true
      ? "Doctor"
      : "DoctorProfile";
  image?: string;
  alt?: string;
  description?: string;
  createdAt: Date;
  order: number;
  active: boolean;
}
