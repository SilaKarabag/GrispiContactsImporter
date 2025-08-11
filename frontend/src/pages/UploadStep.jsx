import React, { useState } from 'react';
import { Upload, Select, message, Typography } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

const { Dragger } = Upload;
const { Option } = Select;
const { Title } = Typography;

function UploadStep({ onNext, onUploadSuccess }) {
  const [importType, setImportType] = useState(null);

  const handleImportTypeChange = (value) => {
    setImportType(value);
  };

  const props = {
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls,.csv',
    showUploadList: false,
    beforeUpload: (file) => {
      if (!importType) {
        message.error('Lütfen önce bir içe aktarma tipi seçin.');
        return Upload.LIST_IGNORE;
      }
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Burada hem veriyi hem de içe aktarma tipini gönderiyoruz.
            onUploadSuccess(json, importType); 
            message.success(`${file.name} başarıyla yüklendi.`);
            onNext();
            resolve(false);
          } catch (error) {
            message.error('Dosya işlenirken bir hata oluştu: ' + error.message);
            reject(error);
          }
        };
        reader.onerror = (error) => {
          message.error('Dosya okunurken bir hata oluştu.');
          reject(error);
        };
        reader.readAsArrayBuffer(file);
      });
    },
  };

  return (
    <div>
      <Title level={4} style={{ color: '#722ED1' }}>
        1. İçe Aktarma Tipi Seçin
      </Title>
      <Select
        style={{ width: '100%', marginBottom: '24px' }}
        placeholder="Bir tür seçin (Contact, Ticket, Organization)"
        onChange={handleImportTypeChange}
        value={importType}
        size="large"
      >
        <Option value="contact">Contact</Option>
        <Option value="ticket">Ticket</Option>
        <Option value="organization">Organization</Option>
      </Select>
      
      <Title level={4} style={{ color: '#722ED1' }}>
        2. Dosyanızı Yükleyin
      </Title>
      <Dragger 
        {...props}
        style={{ 
          backgroundColor: '#f9f0ff',
          border: '2px dashed #722ED1',
          padding: '32px 16px' 
        }}
      >
        <p className="ant-upload-drag-icon" style={{ color: '#722ED1' }}>
          <InboxOutlined style={{ fontSize: '48px' }} />
        </p>
        <p className="ant-upload-text" style={{ color: '#722ED1', fontWeight: 'bold' }}>
          Dosyanızı buraya sürükleyin veya tıklayıp seçin
        </p>
        <p className="ant-upload-hint" style={{ color: '#722ED1' }}>
          Yalnızca Excel (.xlsx, .xls) veya CSV dosyaları desteklenir.
        </p>
      </Dragger>
    </div>
  );
}

export default UploadStep;