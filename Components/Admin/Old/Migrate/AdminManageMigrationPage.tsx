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

const AdminManageMigrationPage = () => {
  const { setPopup } = usePopup();

  return (
    <Box>
      <TabSystem
        name="AdminManageMigration"
        items={[
          {
            icon: <InfoIcon />,
            id: "Doctors",
            content: (
              <List>
                <Button
                  onClick={() =>
                    setPopup("ImportDoctors", <ImportDoctorsPopup />)
                  }
                >
                  ساخت پزشکان قدیم
                </Button>
                <Button
                  onClick={() => setPopup("DropDoctors", <DropDoctorsPoppup />)}
                >
                  انداختن پزشکان جدید
                </Button>
                <Button
                  onClick={() =>
                    setPopup("PurgeDoctors", <PurgeDoctorsPopup />)
                  }
                >
                  پاکسازی پزشکان
                </Button>
                <Button
                  onClick={() =>
                    setPopup("DeleteAllDoctors", <DeleteAllDoctorsPopup />)
                  }
                >
                  انداختن کل پزشکان
                </Button>
              </List>
            ),
            title: "پزشکان",
          },
        ]}
      />
    </Box>
  );
};

export default AdminManageMigrationPage;
