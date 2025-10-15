import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Select, message, Typography } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

const { Dragger } = Upload;
const { Option } = Select;
const { Title } = Typography;

function UploadStep({ onNext, onUploadSuccess }) {
  const { t } = useTranslation();
  const [importType, setImportType] = useState(null);

  const props = {
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls,.csv',
    showUploadList: false,
    beforeUpload: (file) => {
      if (!importType) {
        message.error(t('upload_error_no_type'));
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

            onUploadSuccess(json, importType); 
            message.success(t('upload_success_message', { fileName: file.name }));
            onNext();
            resolve(false);
          } catch (error) {
            message.error(t('upload_error_processing'));
            reject(error);
          }
        };
        reader.onerror = (error) => {
          message.error(t('upload_error_reading'));
          reject(error);
        };
        reader.readAsArrayBuffer(file);
      });
    },
  };

  return (
    <div>
      <Title level={4} style={{ color: '#722ED1' }}>{t('upload_step_title_1')}</Title>
      <Select
        style={{ width: '100%', marginBottom: '24px' }}
        placeholder={t('upload_select_placeholder')}
        onChange={setImportType}
        value={importType}
        size="large"
      >
        <Option value="contact">{t('import_type_contact')}</Option>
        <Option value="ticket">{t('import_type_ticket')}</Option>
        <Option value="organization">{t('import_type_organization')}</Option>
      </Select>
      
      <Title level={4} style={{ color: '#722ED1' }}>{t('upload_step_title_2')}</Title>
      <Dragger {...props} style={{ backgroundColor: '#f9f0ff', border: '2px dashed #722ED1' }}>
        <p className="ant-upload-drag-icon"><InboxOutlined style={{ fontSize: '48px', color: '#722ED1' }} /></p>
        <p className="ant-upload-text" style={{ color: '#722ED1', fontWeight: 'bold' }}>{t('upload_drag_title')}</p>
        <p className="ant-upload-hint" style={{ color: '#722ED1' }}>{t('upload_drag_hint')}</p>
      </Dragger>
    </div>
  );
}

export default UploadStep;