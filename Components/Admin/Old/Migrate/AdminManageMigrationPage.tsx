"use client";

import Button from "@/Components/UI/Button";
import List from "../../UI/List";
import classes from "./AdminManageMigrationPage.module.css";
import usePopup from "@/Components/Hooks/usePopup";
import ImportDoctorsPopup from "./ImportDoctorsPopup";
import DropDoctorsPoppup from "./DropDoctorsPopup";
import Box from "../../UI/Box";
import TabSystem from "../../UI/TabSystem";
import InfoIcon from "@/Components/Icons/InfoIcon";
import PurgeDoctorsPopup from "./PurgeDoctoesPopup";
import DeleteAllDoctorsPopup from "./DeleteAllDoctorsPopup";

const nodes = [
  "doctor",
  "blog",
  "disease",
  "drug",
  "speciality",
  "symptom",
  "part",
] as const;

const AdminManageMigrationPage = () => {
  const { setPopup } = usePopup();

  return (
    <Box>
      <TabSystem
        name="AdminManageMigration"
        items={[
          ...nodes.map((node) => ({
            icon: <InfoIcon />,
            id: node,
            content: (
              <List>
                <Button
                  onClick={() =>
                    setPopup(
                      `import${node}`,
                      <ImportDoctorsPopup node={node} />
                    )
                  }
                >{`import ${node}s`}</Button>
                <Button
                  onClick={() =>
                    setPopup(`drop${node}`, <DropDoctorsPoppup node={node} />)
                  }
                >{`drop ${node}s`}</Button>
                <Button
                  onClick={() =>
                    setPopup(`Purge${node}`, <PurgeDoctorsPopup node={node} />)
                  }
                >{`Purge ${node}s`}</Button>
                <Button
                  onClick={() =>
                    setPopup(
                      `dropAll${node}`,
                      <DeleteAllDoctorsPopup node={node} />
                    )
                  }
                >{`Drop All ${node}s`}</Button>
              </List>
            ),
            title: node,
          })),
        ]}
      />
    </Box>
  );
};

export default AdminManageMigrationPage;
