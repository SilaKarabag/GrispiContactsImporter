import React, { useState, useEffect } from 'react';
import { Button, Table, Checkbox, Typography, Space, Alert } from 'antd';

const { Title } = Typography;

const PreviewStep = ({ onNext, onPrev, fileInfo, onPreviewData }) => {
  const [isHeader, setIsHeader] = useState(true);
  const [previewData, setPreviewData] = useState({ data: [], columns: [] });

  useEffect(() => {
    if (fileInfo && fileInfo.length > 0) {
      const headerRow = isHeader ? fileInfo[0] : null;
      const dataForPreview = isHeader ? fileInfo.slice(1, 6) : fileInfo.slice(0, 5);

      const columns = (headerRow || fileInfo[0]).map((col, index) => ({
        title: isHeader ? col : `Kolon ${index + 1}`,
        dataIndex: index,
        key: index,
        width: 150, // Her kolon için sabit bir genişlik ayarlayın
      }));

      setPreviewData({ data: dataForPreview, columns });
    } else {
      setPreviewData({ data: [], columns: [] });
    }
  }, [fileInfo, isHeader]);

  const handleNext = () => {
    onPreviewData({ data: fileInfo, isHeader: isHeader });
    onNext();
  };

  const handleCheckboxChange = (e) => {
    setIsHeader(e.target.checked);
  };

  if (!fileInfo) {
    return <Alert message="Önizlenecek veri bulunamadı." type="warning" />;
  }

  return (
    <div>
      <Title level={3} style={{ color: '#722ED1' }}>
        Veri Önizleme
      </Title>
      <div style={{ overflowX: 'auto', marginBottom: '16px' }}> {/* Kaydırma için bir div ekleyin */}
        <Table
          columns={previewData.columns}
          dataSource={previewData.data.map((row, index) => ({ ...row, key: index }))}
          pagination={false}
          bordered
          scroll={{ x: 'max-content' }} // Tablo içeriğine göre yatay kaydırma çubuğu ekleyin
        />
      </div>
      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Checkbox checked={isHeader} onChange={handleCheckboxChange}>
          Dosyanın ilk satırını başlık olarak kabul et
        </Checkbox>
        <Space>
          <Button onClick={onPrev}>Geri</Button>
          <Button type="primary" onClick={handleNext}>
            Devam Et
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default PreviewStep;