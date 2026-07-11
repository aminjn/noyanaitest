import { ReactNode } from "react";
import Button from "../UI/Button";
import XMarkIcon from "../Icons/XMarkIcon";

const BookingSelectedFilter = ({
  onClick,
  children,
}: {
  children?: ReactNode;
  onClick: () => unknown;
}) => {
  return (
    <Button
      variant="Neutral"
      mode="Inline"
      size="S"
      radius="High"
      type="button"
      tailIcon={<XMarkIcon />}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

export default BookingSelectedFilter;
