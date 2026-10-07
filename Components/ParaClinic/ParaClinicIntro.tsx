import { ReactNode, useState } from "react";
import classes from "./ParaClinicIntro.module.css";
import { ParaClinicPageProps } from "./ParaClinicPage";
import Ixon from "../UI/Ixon";
import { IProductImage } from "../Admin/Product/AdminManageProductsPage";
import Image from "next/image";
import { FilePath } from "../config";
import StarIcon from "../Icons/StarIcon";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import LocationIcon from "../Icons/LocationIcon";
import ClockIcon from "../Icons/ClockIcon";
import CallingIcon from "../Icons/CallingIcon";
import Link from "@/Components/i18n/Link";
import Badge from "../UI/Badge";
import TruckIcon from "../Icons/TruckIcon";
import ShieldIcon from "../Icons/ShieldIcon";
import Button from "../UI/Button";
import FlaskIcon from "../Icons/FlaskIcon";
import UserIcon from "../Icons/UserIcon";
import StarLineIcon from "../Icons/StarLineIcon";
import ChatBubbleIcon from "../Icons/ChatBubbleIcon";
import {
  tbaseDemiBold,
  tbaseRegular,
  tsmBold,
  tsmRegular,
  txlMedium,
  txsRegular,
} from "../UI/Typography";
import HostedImage from "../UI/HostedImage";

const NS: ContentNamespace[] = ["common", "paraClinicPage"];

const Box = ({
  icon,
  value,
  show,
}: {
  icon: ReactNode;
  value: string;
  show: boolean;
}) => {
  if (!show) return null;
  return (
    <div className={classes.box}>
      <Ixon width="1rem">{icon}</Ixon>
      <span className={`${classes.boxValue} ${tsmBold}`}>{value}</span>
    </div>
  );
};

const Detail = ({ icon, value }: { icon: ReactNode; value: string }) => {
  return (
    <div className={classes.detail}>
      <Ixon width="1rem" className={classes.detailIcon}>
        {icon}
      </Ixon>
      <span className={tsmRegular}>{value}</span>
    </div>
  );
};

const Card = ({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value: string;
}) => {
  return (
    <div className={classes.card}>
      <div className={`${classes.cardIcon} glassIcon tone-teal`}>
        <Ixon width="1.5rem">{icon}</Ixon>
      </div>
      <div className={classes.cardContent}>
        <legend className={`${classes.cardTitle} ${tbaseRegular}`}>
          {title}
        </legend>
        <span className={`${classes.cardvalue} ${tbaseDemiBold}`}>{value}</span>
      </div>
    </div>
  );
};

const ParaClinicIntro = ({ data, takesOrders }: ParaClinicPageProps) => {
  const tests = Array.isArray(data.tests) ? data.tests : [];
  const tags = Array.isArray(data.tags) ? data.tags : [];
  // gallery first; a paraclinic with only its main image still shows it
  const images: IProductImage[] = Array.isArray(data.images) ? data.images : [];
  const [currentImage, setCurrentImage] = useState<IProductImage | undefined>(
    images[0],
  );

  const getContent = useScopedLocale(NS);

  return (
    <div className={classes.container}>
      <div className={classes.main}>
        <div className={classes.intro}>
          <div className={classes.image}>
            <HostedImage
              src={currentImage?.image || data.image}
              alt={currentImage?.alt || data.name || ""}
              sizes="36rem"
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
          <div className={classes.content}>
            <h1 className={`${classes.h1} ${txlMedium}`}>{data.name}</h1>
            <div className={classes.stats}>
              <Ixon className={classes.star} width="1rem">
                <StarIcon />
              </Ixon>
              <span className={`${classes.score} ${tsmBold}`}>
                {data.averageScore?.toFixed(1)}
              </span>
              <span
                className={`${classes.commentCount} ${tsmRegular}`}
              >{`(${getContent("nComments", [data.commentCount?.toString() || "0"])})`}</span>
              {!!data.establishment && (
                <span className={`${classes.commentCount} ${txsRegular}`}>
                  {getContent("establishedAtx", [data.establishment])}
                </span>
              )}
            </div>
            <div className={classes.details}>
              {(!!data.province || !!data.city || !!data.district) && (
                <Detail
                  icon={<LocationIcon />}
                  value={[
                    data.province?.name,
                    data.city?.name,
                    data.district?.name,
                  ]
                    .filter(Boolean)
                    .join(getContent("addressPartsSeparator"))}
                />
              )}
              {!!data.businessTime && (
                <Detail icon={<ClockIcon />} value={data.businessTime} />
              )}
              {!!data.phone && (
                <Detail icon={<CallingIcon />} value={data.phone} />
              )}
            </div>
            {!!tags.length && (
              <div className={classes.tags}>
                {tags.map((tag) => (
                  // a tag is a filter: it opens the list narrowed to it
                  <Link key={tag._id} href={`/paraClinic?tag=${tag._id}`}>
                    <Badge
                      color="Primarylight"
                      radius="High"
                      mode="Fill"
                      size="XXL"
                    >
                      {tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
            <div className={classes.boxes}>
              <Box
                icon={<TruckIcon />}
                value={getContent("onPremisesSampling")}
                show={data.onPremises}
              />
              <Box
                icon={<ClockIcon />}
                value={getContent("onlineResponding")}
                show={data.onlineResponse}
              />
              <Box
                icon={<ShieldIcon />}
                value={getContent("basicInsurance")}
                show={data.basicInsurance}
              />
            </div>
            <div className={classes.actions}>
              {/* the CTA goes to the tests it can book: none listed, or a
                  lab that takes no online orders, has no such list */}
              {!!tests.length && takesOrders !== false && (
                <Button
                  variant="Primary"
                  mode="Fill"
                  radius="High"
                  size="M"
                  tailIcon={<FlaskIcon />}
                  href="#Tests"
                >
                  {getContent("reserveTest")}
                </Button>
              )}
              {/* <Button
                variant="Secondary"
                mode="Fill"
                size="M"
                radius="High"
                tailIcon={<TruckIcon />}
              >
                {getContent("onPremisesSampling")}
              </Button> */}
              {!!data.phone && (
                <Button
                  variant="Neutral"
                  mode="Outline"
                  size="M"
                  radius="High"
                  tailIcon={<CallingIcon />}
                  href={`tel:${data.phone}`}
                >
                  {getContent("call")}
                </Button>
              )}
            </div>
          </div>
        </div>
        {images.length > 1 && (
          <div className={classes.navs}>
            {images.map((image) => (
              <div
                key={image._id}
                onClick={() => setCurrentImage(image)}
                className={`${classes.nav} ${currentImage?._id === image._id ? classes.activeNav : ""} `}
              >
                <HostedImage
                  fill
                  src={image.image}
                  sizes="22rem"
                  style={{ objectFit: "cover" }}
                  alt={image.alt || ""}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className={classes.cards}>
        <Card
          icon={<FlaskIcon />}
          title={getContent("servicesAndTests")}
          value={tests.length.toString()}
        />
        <Card
          icon={<UserIcon />}
          title={getContent("specialistPersonel")}
          value={getContent("nPerson", [String(data.personelCount ?? 0)])}
        />
        <Card
          icon={<StarLineIcon />}
          title={getContent("usersScore")}
          value={data.averageScore?.toFixed(1) || "0"}
        />
        <Card
          icon={<ChatBubbleIcon />}
          title={getContent("submittedCommentsCount")}
          value={data.commentCount?.toString() || "0"}
        />
      </div>
    </div>
  );
};

export default ParaClinicIntro;
