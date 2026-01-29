import AsyncSelect from "react-select/async";
import { getLocations } from "../services/api";
// import "../styles/Loading.css";

const LocationSelect = ({ countryCode, data, value, onChange }) => {
  const fetchLocations = async (inputValue) => {
    const response = await getLocations(inputValue, countryCode);
    return response.data.results.map((loc) => ({
      value: loc.location_code,
      label: `${loc.location_name} (${loc.location_code})`,
    }));
  };

  const customstyles = {
    control: (provided) => ({
      ...provided,
      borderRadius: "8px",
      boxShadow: "none",
      minHeight: "45px",
    }),
    indicatorsContainer: (provided) => ({ ...provided, display: "none" }),
    singleValue: (provided) => ({
      ...provided,
      color: "#000",
      fontWeight: "400",
      textAlign: "left",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#888",
      fontSize: "16px",
      textAlign: "left",
    }),
  };

  return (
    <AsyncSelect
      placeholder="Search location..."
      loadOptions={fetchLocations}
      defaultOptions={data}
      styles={customstyles}
      isClearable
      value={
        value
          ? {
              value,
              label: data.find((item) => item.value === value)?.label || value,
            }
          : null
      }
      onChange={(selectedOption) => {
        onChange(selectedOption?.value || null);
      }}
    />
  );
};

export default LocationSelect;
