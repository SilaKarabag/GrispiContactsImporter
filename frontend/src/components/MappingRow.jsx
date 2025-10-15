import React from 'react';
import { Select } from 'antd';

const MappingRow = ({ columnName, crmFields, onMappingChange }) => {
  const options = [
    { value: 'Do not import this column', label: 'Bu kolonu içe aktarma' },
    ...crmFields,
  ];

  return (
    <Select
      showSearch
      style={{ width: 250 }}
      placeholder="Uygun bir alan seçin"
      optionFilterProp="children"
      onChange={(value) => onMappingChange(columnName, value)}
      filterOption={(input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
      options={options}
    />
  );
};

export default MappingRow;