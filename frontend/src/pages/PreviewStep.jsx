import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Table, Checkbox, Typography, Space, Alert } from 'antd';

const { Title } = Typography;

const PreviewStep = ({ onNext, onPrev, fileInfo, onPreviewData }) => {
  const { t } = useTranslation();
  const [isHeader, setIsHeader] = useState(true);
  const [previewData, setPreviewData] = useState({ data: [], columns: [] });

  useEffect(() => {
    if (fileInfo && fileInfo.length > 0) {
      const headerRow = isHeader ? fileInfo[0] : null;
      const dataForPreview = isHeader ? fileInfo.slice(1, 6) : fileInfo.slice(0, 5);

      const columns = (headerRow || fileInfo[0]).map((col, index) => ({
        title: isHeader ? col : t('preview_default_column_name', { index: index + 1 }),
        dataIndex: index,
        key: index,
        width: 150,
      }));

      const dataSource = dataForPreview.map((row, rowIndex) => {
        const rowObject = { key: rowIndex };
        row.forEach((cell, cellIndex) => {
            rowObject[cellIndex] = cell;
        });
        return rowObject;
      });

      setPreviewData({ data: dataSource, columns });
    } else {
      setPreviewData({ data: [], columns: [] });
    }
  }, [fileInfo, isHeader, t]);

  const handleNext = () => {
    onPreviewData({ data: fileInfo, isHeader: isHeader });
    onNext();
  };

  if (!fileInfo) {
    return <Alert message={t('preview_no_data')} type="warning" />;
  }

  return (
    <div>
      <Title level={3} style={{ color: '#722ED1' }}>{t('preview_step_title')}</Title>
      <Table
        columns={previewData.columns}
        dataSource={previewData.data}
        pagination={false}
        bordered
        scroll={{ x: 'max-content' }}
        style={{ marginBottom: 16 }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Checkbox checked={isHeader} onChange={(e) => setIsHeader(e.target.checked)}>
          {t('preview_header_checkbox')}
        </Checkbox>
        <Space>
          <Button onClick={onPrev}>{t('btn_back')}</Button>
          <Button type="primary" onClick={handleNext}>{t('btn_continue')}</Button>
        </Space>
      </div>
    </div>
  );
};

export default PreviewStep;