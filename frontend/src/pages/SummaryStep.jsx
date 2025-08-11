import React from 'react';
import { Typography, Button, Space, Card, Row, Col, Statistic, Table } from 'antd';
import { CheckCircleOutlined, DatabaseOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const SummaryStep = ({ onNext, onPrev, mappingResult }) => {
  if (!mappingResult) {
    return <Alert message="Özet verisi bulunamadı." type="warning" />;
  }

  const { mappedFields, totalRows } = mappingResult;
  const mappedFieldCount = Object.keys(mappedFields).filter(key => mappedFields[key] !== 'Do not import this column').length;
  
  // Tablo için veri kaynağını oluştur
  const tableData = Object.keys(mappedFields)
    .filter(key => mappedFields[key] !== 'Do not import this column')
    .map((columnIndex, index) => ({
      key: index,
      excelColumn: `Kolon ${parseInt(columnIndex, 10) + 1}`, // Varsayılan kolon adını kullan
      grispiField: mappedFields[columnIndex]
    }));

  const columns = [
    {
      title: 'Excel Kolonu',
      dataIndex: 'excelColumn',
      key: 'excelColumn',
    },
    {
      title: 'Grispi Alanı',
      dataIndex: 'grispiField',
      key: 'grispiField',
    },
  ];

  return (
    <div>
      <Title level={3} style={{ color: '#722ED1' }}>
        İçe Aktarma Özeti
      </Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        Eşleştirme işleminin bir özeti aşağıda sunulmuştur. Lütfen devam etmeden önce bilgileri kontrol edin.
      </Text>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card bordered={false}>
            <Statistic
              title="Eşleştirilen Alan Sayısı"
              value={mappedFieldCount}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card bordered={false}>
            <Statistic
              title="Veri Satırı Sayısı"
              value={totalRows}
              prefix={<DatabaseOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={<Text strong>Eşleştirme Detayları</Text>}
        style={{ marginTop: '24px' }}
      >
        {tableData.length > 0 ? (
          <Table
            dataSource={tableData}
            columns={columns}
            pagination={false}
            bordered
            size="small"
          />
        ) : (
          <Text type="secondary">Herhangi bir Grispi alanı eşleştirilmedi.</Text>
        )}
      </Card>

      <Space style={{ marginTop: '24px' }}>
        <Button onClick={onPrev}>Geri</Button>
        <Button type="primary" onClick={onNext}>
          Devam Et
        </Button>
      </Space>
    </div>
  );
};

export default SummaryStep;