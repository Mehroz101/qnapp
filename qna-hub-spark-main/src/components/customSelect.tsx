import React from 'react';
import CreatableSelect from 'react-select/creatable';

export type OptionType = {
  label: string;
  value: string | number;
};

interface CustomSelectProps {
  /** Options list */
  options: { value: string; label: string }[];
  /** Placeholder text */
  placeholder?: string;
  /** Handle selected value */
  onChange?: (option: { value: string; label: string } | null) => void;
  /** Current value */
  value?: { value: string; label: string } | null;
  /** Allow multiple selection */
  isMulti?: boolean;
  /** Allow clearing selection */
  isClearable?: boolean;
  /** Additional props for react-select */
  [key: string]: any;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  placeholder = 'Select...',
  onChange,
  value,
  isMulti = false,
  isClearable = true,
  ...rest
}) => {
  return (
    <CreatableSelect
      isClearable={isClearable}
      options={options}
      placeholder={placeholder}
      onChange={onChange}
      value={value}
      isMulti={isMulti}
      {...rest}
      className="w-full"
      classNames={{
        control: ({ isFocused }) =>
          [
            "w-full rounded-2xl border px-4 py-1 transition-all duration-200",
            "bg-white dark:bg-gray-800",
            "text-gray-900 dark:text-white",
            isFocused
              ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800"
              : "border-gray-300 dark:border-gray-600",
          ].join(" "),
        placeholder: () => "text-gray-500 dark:text-gray-400",
        singleValue: () => "text-gray-900 dark:text-white",
        input: () => "text-gray-900 dark:text-white",
        option: ({ isFocused, isSelected }) =>
          [
            "px-4 py-2 cursor-pointer",
            isSelected
              ? "bg-blue-500 text-white"
              : isFocused
                ? "bg-blue-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                : "text-gray-900 dark:text-white",
          ].join(" "),
        menu: () => "mt-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg z-50",
        multiValue: () =>
          "bg-blue-100 text-blue-700 rounded-md px-2 py-0.5 dark:bg-blue-900 dark:text-blue-200",
        multiValueLabel: () => "text-sm",
        multiValueRemove: () =>
          "text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100 cursor-pointer",
      }}

      styles={{
        control: (provided) => ({
          ...provided,
          borderRadius: 10,
          padding: "6px 2px",
        }),
      }}
    />
  );
};

export default CustomSelect;
