import classes from "./SelectMediaPopup.module.css";
import { MongoDoc } from "@/Components/Hooks/useUser";

const mediaKinds = ["image", "video"] as const;

type MediaKind = (typeof mediaKinds)[number];

export interface IMedia extends MongoDoc {
  title: string;
  kind: MediaKind;
  alt?: string;
  src: string;
}

const SelectMediaPopup = ({
  onDone,
}: {
  onDone: (media: IMedia) => unknown;
}) => {
  return <></>;
};
export default SelectMediaPopup;
