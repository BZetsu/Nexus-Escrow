import React, { useState, useEffect } from "react";
import axios from "axios";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";

const CountryInput = ({ editForm, setEditForm }: any) => {
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    // Fetch the list of countries from the REST Countries API
    axios
      .get("https://restcountries.com/v3.1/all")
      .then((response) => {
        // Sort countries by name and set them in state
        const sortedCountries = response.data
          .map((country: { name: { common: string } }) => country.name.common)
          .sort();
        setCountries(sortedCountries);
      })
      .catch((error) => {
        console.error("Error fetching countries:", error);
      });
  }, []);

  return (
    <FormControl fullWidth>
      <InputLabel id="country-label" className="!text-[13px]">
        Country
      </InputLabel>
      <Select
        labelId="country-label"
        id="country"
        value={editForm.country}
        onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
        label="Country"
        className="!h-[52px] !text-xs"
      >
        {countries.map((country) => (
          <MenuItem key={country} value={country} className="!text-sm">
            {country}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CountryInput;
