import useLocale from "@/Components/Hooks/useLocale";
import classes from "./PrescriptionList.module.css";
import IconButton from "@/Components/Admin/UI/IconButton";
import EyeIcon from "@/Components/Icons/EyeIcon";
import { useState } from "react";
import Ixon from "@/Components/UI/Ixon";
import FolderIcon from "@/Components/Icons/FolderIcon";
import Button from "@/Components/UI/Button";
import PrescriptionFiller from "./PrescriptionFiller";
import PrescriptionFillPatient from "./PrescriptionFillPatient";
import PrescriptionListItem from "./PrescriptionListItem";
import { IncomingTaminPharmacyResponse } from "./FindPrescriptionAgent";

const PrescriptionList = ({
  data,
  onCancel,
}: {
  data: IncomingTaminPharmacyResponse;
  onCancel: () => unknown;
}) => {
  const getContent = useLocale();

  const [selected, setSelected] = useState<
    null | IncomingTaminPharmacyResponse["list"][number]
  >(null);

  console.log(data);

  if (!selected)
    return (
      <div className={classes.main}>
        <h1 className={classes.h1}>{getContent("fillingPrescription")}</h1>
        <div className={classes.box}>
          <PrescriptionFillPatient />
          <div className={classes.content}>
            <h2 className={classes.h2}>{getContent("activePrescriptions")}</h2>
            <div className={classes.list}>
              {data.list.map((prescription) => (
                <PrescriptionListItem
                  key={prescription.headeprscid}
                  prescription={prescription}
                  action={
                    <IconButton
                      variant="Info"
                      onClick={() => setSelected(prescription)}
                    >
                      <EyeIcon />
                    </IconButton>
                  }
                />
              ))}
            </div>
          </div>
        </div>
        <Button onClick={onCancel} variant="Error" className={classes.cancel}>
          {getContent("cancel")}
        </Button>
      </div>
    );

  return (
    <PrescriptionFiller
      prescription={selected}
      data={data}
      onBack={() => setSelected(null)}
    />
  );
};

export default PrescriptionList;
