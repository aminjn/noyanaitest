import Image from "next/image";
import { IService } from "../Admin/Service/AdminManageServicesPage";
import classes from "./ServiceCard.module.css";
import { FilePath } from "../config";
import { IServicePackage } from "../Admin/ServicePackage/AdminManageServicePackagesPage";
import { getDoctorProfileLabel } from "../Admin/Lib/LabelGetters";
import Ixon from "../UI/Ixon";
import LocationIcon from "../Icons/LocationIcon";
import ServiceOrProductCard from "./ServiceOrProductCard";
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
      commentCount={3}
      target={`/${node.model === "Service" ? "service" : "servicePackage"}/${node.slug || node._id}`}
      discount={node.discount}
      name={node.name || ""}
      price={node.price}
      rating={4.5}
      category={node.category?.title}
      owner={
        node.owner
          ? {
              icon: (
                <div className={classes.doctorImage}>
                  <Image
                    alt={getDoctorProfileLabel(node.owner)}
                    src={`${FilePath}/${node.owner.avatar}`}
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
