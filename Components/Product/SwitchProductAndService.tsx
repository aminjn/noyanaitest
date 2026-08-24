import { usePathname } from "next/navigation";
import useScopedLocale from "../Hooks/useScopedLocale";
import Button from "../UI/Button";
import classes from "./SwitchProductAndService.module.css";
import { ContentKey } from "../Enums/contentKeys";

const links = ["/product", "/service"] as const;

type Link = (typeof links)[number];

const linkContentKeyDict: Record<Link, ContentKey> = {
  "/product": "noyanPharmacry",
  "/service": "noyanServices",
};

const SwitchProductAndService = () => {
  const getContent = useScopedLocale(["products", "services"]);

  const pathname = usePathname();

  return (
    <div className={classes.main}>
      {links.map((link) => (
        <Button
          key={link}
          href={link}
          variant="Primary"
          mode={pathname === link ? "Fill" : "Outline"}
          size="M"
          radius="Medium"
        >
          {getContent(linkContentKeyDict[link])}
        </Button>
      ))}
    </div>
  );
};

export default SwitchProductAndService;
