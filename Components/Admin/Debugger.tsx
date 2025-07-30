import { useState } from "react";
import classes from "./Debugger.module.css";
import Button from "../UI/Button";
import Act from "../UI/Act";
import { API } from "../config";
import Box from "./UI/Box";

const Debugger = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  return (
    <Box>
      <Button onClick={() => setIsLoading(true)} isLoading={isLoading}>
        GO
      </Button>
      <Act
        path={isLoading ? `${API}/admin/debug` : null}
        onDone={(_, data) => {
          setIsLoading(false);
          console.log(data);
        }}
      />
    </Box>
  );
};

export default Debugger;
