import Image from "next/image";
import { IService } from "../Admin/Service/AdminManageServicesPage";
import classes from "./ServiceCard.module.css";
import { FilePath } from "../config";
import { IServicePackage } from "../Admin/ServicePackage/AdminManageServicePackagesPage";
import { getDoctorProfileLabel } from "../Admin/Lib/LabelGetters";
import Ixon from "../UI/Ixon";
import LocationIcon from "../Icons/LocationIcon";
import ServiceOrProductCard from "./ServiceOrProductCard";
import HostedImage from "../UI/HostedImage";
const ServiceCard = ({
  node,
}: {
  node:
    | (IService<{
        Category: Record<never, never>;
        Owner: { Province: Record<never, never> };
      }> & { model: "Service" })
    | (IServicePackage<{
        Category: Record<never, never>;
        Owner: { Province: Record<never, never> };
        Services: Record<never, never>;
      }> & { model: "ServicePackage" });
}) => {
  return (
    <ServiceOrProductCard
      commentCount={node.commentCount}
      target={`/${node.model === "Service" ? "service" : "servicePackage"}/${node.slug || node._id}`}
      discount={node.discount}
      name={node.name || ""}
      price={node.price}
      rating={node.averageScore}
      category={node.category?.title}
      owner={
        node.owner
          ? {
              icon: (
                <div className={classes.doctorImage}>
                  <HostedImage
                    alt={getDoctorProfileLabel(node.owner)}
                    src={node.owner.avatar}
                    sizes=".75rem"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
              ),
              title: getDoctorProfileLabel(node.owner),
            }
          : undefined
      }
      image={node.image}
      detail={
        node.owner?.province
          ? {
              icon: (
                <Ixon width=".75rem">
                  <LocationIcon />
                </Ixon>
              ),
              title: node.owner.province.name || "",
            }
          : undefined
      }
      pack={node.model === "ServicePackage" ? node.services.length : undefined}
      packageInfo={
        node.model === "ServicePackage"
          ? node.services.map((service) => service.name || "").join("، ")
          : undefined
      }
    />
  );
};

export default ServiceCard;
