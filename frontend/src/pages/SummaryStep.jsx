import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Button, Space, Card, Row, Col, Statistic, Table, Alert } from 'antd';
import { CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const SummaryStep = ({ onNext, onPrev, mappingResult }) => {
  const { t } = useTranslation();

  if (!mappingResult) {
    return <Alert message={t('summary_no_data')} type="warning" />;
  }

  const { mappedFields, totalRows, errors } = mappingResult;
  const validRowsCount = totalRows - errors.length;

  const tableData = Object.keys(mappedFields)
    .filter(key => mappedFields[key] !== 'do_not_import')
    .map((columnIndex, index) => ({
      key: index,
      excelColumn: t('preview_default_column_name', { index: parseInt(columnIndex, 10) + 1 }),
      grispiField: mappedFields[columnIndex]
    }));

  const columns = [
    {
      title: t('summary_table_col_excel'),
      dataIndex: 'excelColumn',
      key: 'excelColumn',
    },
    {
      title: t('summary_table_col_grispi'),
      dataIndex: 'grispiField',
      key: 'grispiField',
    },
  ];

  return (
    <div>
      <Title level={3} style={{ color: '#722ED1' }}>
        {t('summary_step_title')}
      </Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        {t('summary_step_description')}
      </Text>

      {errors.length > 0 && (
        <Alert
          message={t('summary_alert_title')}
          description={t('summary_alert_description', { count: errors.length })}
          type="warning"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card bordered={false}>
            <Statistic
              title={t('summary_stat_success')}
              value={validRowsCount}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card bordered={false}>
            <Statistic
              title={t('summary_stat_failed')}
              value={errors.length}
              prefix={<WarningOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={<Text strong>{t('summary_mapping_details_title')}</Text>}
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
          <Text type="secondary">{t('summary_no_mapping')}</Text>
        )}
      </Card>
      
      <Space style={{ marginTop: '24px' }}>
        <Button onClick={onPrev}>{t('btn_back')}</Button>
        <Button type="primary" onClick={onNext}>
          {t('btn_continue')}
        </Button>
      </Space>
    </div>
  );
};

export default SummaryStep;