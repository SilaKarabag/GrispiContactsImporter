import React, { useState, useEffect } from 'react';
import { Button, Table, Select, Typography, Space, message, Alert } from 'antd';

const { Title } = Typography;
const { Option } = Select;

const mappingOptions = {
  contact: [
    { value: 'FirstName', label: 'First Name' },
    { value: 'LastName', label: 'Last Name' },
    { value: 'Email', label: 'Email (Zorunlu)' },
    { value: 'Phone', label: 'Phone (Zorunlu)' },
    { value: 'Organization', label: 'Organization' },
    { value: 'Language', label: 'Language' },
    { value: 'Tags', label: 'Tags' },
    { value: 'Groups', label: 'Groups' },
    { value: 'Role', label: 'Role' },
    { value: 'Enabled', label: 'Enabled' },
    { value: 'Do not import this column', label: 'Bu kolonu içe aktarma' }
  ],
  ticket: [
    { value: 'Subject', label: 'Subject (Zorunlu)' },
    { value: 'Creator', label: 'Creator (Zorunlu)' },
    { value: 'Requester', label: 'Requester (Zorunlu)' },
    { value: 'Status', label: 'Status (Zorunlu)' },
    { value: 'Description', label: 'Description' },
    { value: 'Assignee', label: 'Assignee' },
    { value: 'Assignee Group', label: 'Assignee Group' },
    { value: 'Channel', label: 'Channel' },
    { value: 'Type', label: 'Type' },
    { value: 'Priority', label: 'Priority' },
    { value: 'Form', label: 'Form' },
    { value: 'CreatedAt', label: 'Created At' },
    { value: 'UpdatedAt', label: 'Updated At' },
    { value: 'SolvedAt', label: 'Solved At' },
    { value: 'Tags', label: 'Tags' },
    { value: 'Do not import this column', label: 'Bu kolonu içe aktarma' }
  ],
  organization: [
    { value: 'Name', label: 'Name (Zorunlu)' },
    { value: 'Description', label: 'Description' },
    { value: 'Details', label: 'Details' },
    { value: 'Notes', label: 'Notes' },
    { value: 'Group', label: 'Group' },
    { value: 'Domains', label: 'Domains' },
    { value: 'Tags', label: 'Tags' },
    { value: 'Do not import this column', label: 'Bu kolonu içe aktarma' }
  ],
};

const MappingStep = ({ onNext, onPrev, data, importType, onMappingComplete }) => {
  const [columnData, setColumnData] = useState([]);
  const [selectedMapping, setSelectedMapping] = useState({});
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (data && data.data) {
      const { data: rawData, isHeader } = data;

      const headers = isHeader ? rawData[0] : rawData[0].map((_, i) => `Kolon ${i + 1}`);
      const sampleRows = isHeader ? rawData.slice(1, 3) : rawData.slice(0, 2);

      const columns = headers.map((header, index) => ({
        header: header,
        sample1: sampleRows[0] ? sampleRows[0][index] : null,
        sample2: sampleRows[1] ? sampleRows[1][index] : null,
        key: index,
      }));

      setColumnData(columns);
    }
  }, [data]);

  const handleMappingChange = (columnIndex, field) => {
    setSelectedMapping(prev => ({
      ...prev,
      [columnIndex]: field,
    }));
  };

  const handleNext = () => {
    const mappedValues = Object.values(selectedMapping);

    // Adım 1: Zorunlu kolonların eşleştirilip eşleştirilmediğini kontrol et
    if (importType === 'ticket') {
      const requiredFields = ['Subject', 'Creator', 'Requester', 'Status'];
      const hasAllRequired = requiredFields.every(field => mappedValues.includes(field));
      if (!hasAllRequired) {
        messageApi.error('Ticket için "Subject", "Creator", "Requester" ve "Status" alanları zorunludur.');
        return;
      }
    } else if (importType === 'organization') {
      if (!mappedValues.includes('Name')) {
        messageApi.error('Organization için "Name" alanı zorunludur.');
        return;
      }
    } else if (importType === 'contact') {
      const hasEmailOrPhone = mappedValues.includes('Email') || mappedValues.includes('Phone');
      if (!hasEmailOrPhone) {
        messageApi.error('Contact için "Email" veya "Phone" alanlarından en az biri zorunludur.');
        return;
      }
    }

    // Adım 2: Her bir veri satırının zorunlu alanları içerip içermediğini kontrol et
    const dataRows = data.isHeader ? data.data.slice(1) : data.data;
    let requiredFieldsColumnIndices = {};

    if (importType === 'contact') {
      const emailColIndex = Object.keys(selectedMapping).find(key => selectedMapping[key] === 'Email');
      const phoneColIndex = Object.keys(selectedMapping).find(key => selectedMapping[key] === 'Phone');
      
      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        const hasEmail = emailColIndex !== undefined && row[emailColIndex] && String(row[emailColIndex]).trim() !== '';
        const hasPhone = phoneColIndex !== undefined && row[phoneColIndex] && String(row[phoneColIndex]).trim() !== '';
        
        if (!hasEmail && !hasPhone) {
          messageApi.error(`Satır ${i + 1} için zorunlu alanlardan (Email veya Phone) en az biri boş bırakılamaz.`);
          return;
        }
      }
    } else if (importType === 'organization') {
      const nameColIndex = Object.keys(selectedMapping).find(key => selectedMapping[key] === 'Name');
      if (nameColIndex !== undefined) {
        for (let i = 0; i < dataRows.length; i++) {
          if (!dataRows[i][nameColIndex] || String(dataRows[i][nameColIndex]).trim() === '') {
            messageApi.error(`Satır ${i + 1} için "Name" alanı boş bırakılamaz.`);
            return;
          }
        }
      }
    } else if (importType === 'ticket') {
      const requiredTicketFields = ['Subject', 'Creator', 'Requester', 'Status'];
      requiredFieldsColumnIndices = requiredTicketFields.map(field => 
        Object.keys(selectedMapping).find(key => selectedMapping[key] === field)
      );

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        for (const colIndex of requiredFieldsColumnIndices) {
          if (colIndex === undefined || !row[colIndex] || String(row[colIndex]).trim() === '') {
            const fieldName = selectedMapping[colIndex];
            messageApi.error(`Satır ${i + 1} için "${fieldName}" alanı boş bırakılamaz.`);
            return;
          }
        }
      }
    }

    // Doğrulama başarılıysa bir sonraki adıma geç
    const mappingResult = {
      mappedFields: selectedMapping,
      totalRows: data.data.length - (data.isHeader ? 1 : 0),
    };
    onMappingComplete(mappingResult);
    onNext();
  };

  if (!data || !data.data) {
    return <Alert message="Eşlenecek veri bulunamadı." type="warning" />;
  }

  const availableOptions = mappingOptions[importType] || [];

  return (
    <div>
      {contextHolder}
      <Title level={3} style={{ color: '#722ED1' }}>
        Veriyi Uygun Grispi Alanlarıyla Eşle
      </Title>
      <Table
        dataSource={columnData.map((item, index) => ({ ...item, key: index }))}
        pagination={false}
        bordered
        columns={[
          {
            title: 'Kolon Adı',
            dataIndex: 'header',
            key: 'header',
            width: '25%',
          },
          {
            title: 'Örnek 1',
            dataIndex: 'sample1',
            key: 'sample1',
            width: '25%',
          },
          {
            title: 'Örnek 2',
            dataIndex: 'sample2',
            key: 'sample2',
            width: '25%',
          },
          {
            title: 'Grispi Alanı',
            dataIndex: 'key',
            key: 'grispi_field',
            width: '25%',
            render: (key) => (
              <Select
                placeholder="Uygun bir alan seçin"
                onChange={(value) => handleMappingChange(key, value)}
                style={{ width: '100%' }}
              >
                {availableOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            ),
          },
        ]}
      />
      <Space style={{ marginTop: '24px' }}>
        <Button onClick={onPrev}>Geri</Button>
        <Button type="primary" onClick={handleNext}>
          Devam Et
        </Button>
      </Space>
    </div>
  );
};

export default MappingStep;