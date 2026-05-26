import { useState } from "react";
import SearchIcon from "../Icons/SearchIcon";
import Ixon from "../UI/Ixon";

const SearchButton = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <button type="button">
      <Ixon width="1.5rem">
        <SearchIcon />
      </Ixon>
    </button>
  );
};

export default SearchButton;
