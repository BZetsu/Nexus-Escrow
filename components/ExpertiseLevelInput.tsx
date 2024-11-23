import React, { FC } from "react";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";

const ExpertiseLevelInput = ({ editForm, setEditForm }: any) => {
  const levels = ["Entry Level", "Intermediate", "Expert"];

  return (
    <FormControl fullWidth>
      <InputLabel id="expertise-level-label" className="!text-[13px]">
        Expertise Level
      </InputLabel>
      <Select
        labelId="expertise-level-label"
        id="expertise-level"
        value={editForm.levelOfExpertise}
        onChange={(e) =>
          setEditForm({ ...editForm, levelOfExpertise: e.target.value })
        }
        label="Expertise Level"
        className="!h-[52px] !text-xs"
      >
        {levels.map((level) => (
          <MenuItem key={level} value={level} className="!text-sm">
            {level}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ExpertiseLevelInput;
