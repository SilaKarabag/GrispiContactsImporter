import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Typography, Space, notification, Alert, Card, Statistic, List, Tag } from 'antd';
import { DownloadOutlined, CheckCircleOutlined, CloseCircleOutlined, FileTextOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

// Yardımcı Fonksiyon: JSON verisini CSV metnine dönüştürür
const jsonToCsv = (jsonData) => {
    if (!jsonData || jsonData.length === 0) {
        return "";
    }
    const headers = Object.keys(jsonData[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of jsonData) {
        const values = headers.map(header => {
            const escaped = ('' + (row[header] || '')).replace(/"/g, '""'); // Çift tırnakları escape et
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
};

const ResultStep = ({ onPrev, validationResults = [] }) => {
  const { t } = useTranslation();

  const successfulResults = validationResults.filter(r => r.status === 'başarılı');
  const failedResults = validationResults.filter(r => r.status === 'hatalı');

  const totalValidRows = successfulResults.length;
  const totalFailedRows = failedResults.length;
  const isCompleteSuccess = totalFailedRows === 0 && totalValidRows > 0;

  const finalJsonData = successfulResults.map(r => r.transformed);

  const handleDownloadJson = () => {
    if (!finalJsonData || finalJsonData.length === 0) {
      notification.error({ message: 'Error', description: t('download_error_no_data') });
      return;
    }
    const jsonString = JSON.stringify(finalJsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grispi_import_success.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notification.success({ message: 'Success', description: t('download_success_message') });
  };

  const handleDownloadCsv = () => {
    if (!finalJsonData || finalJsonData.length === 0) {
        notification.error({ message: 'Error', description: t('download_error_no_data') });
        return;
    }
    const csvString = jsonToCsv(finalJsonData);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grispi_import_success.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notification.success({ message: 'Success', description: t('download_success_message') });
  };

  if (!validationResults || validationResults.length === 0) {
    return <Alert message={t('result_no_data')} type="error" />;
  }

  return (
    <div>
      <Title level={3} style={{ color: '#722ED1' }}>{t('result_step_title')}</Title>

      {isCompleteSuccess ? (
        <Alert
          message={t('result_alert_success_title')}
          description={t('result_alert_success_desc', { count: totalValidRows })}
          type="success" showIcon style={{ marginBottom: '16px' }}
        />
      ) : (
        <Alert
          message={t('result_alert_warning_title')}
          description={t('result_alert_warning_desc', { successCount: totalValidRows, failedCount: totalFailedRows })}
          type="warning" showIcon style={{ marginBottom: '16px' }}
        />
      )}

      <Space size="large" style={{ marginBottom: '24px' }}>
          <Card bordered={false}>
            <Statistic
              title={t('summary_stat_success')}
              value={totalValidRows}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
          <Card bordered={false}>
            <Statistic
              title={t('summary_stat_failed')}
              value={totalFailedRows}
              prefix={<CloseCircleOutlined style={{ color: '#f5222d' }} />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
      </Space>

      {failedResults.length > 0 && (
        <Card title={<Text strong>{t('result_failed_rows_title')}</Text>} style={{ marginBottom: '24px' }}>
          <List
            size="small"
            bordered
            dataSource={failedResults.slice(0, 10)}
            renderItem={item => (
              <List.Item>
                <Tag color="error">{t('row_label', { rowNumber: item.rowNumber })}</Tag>
                <Text type="danger">{item.errors.join(', ')}</Text>
              </List.Item>
            )}
          />
        </Card>
      )}

      <Paragraph>{t('result_json_preview_desc')}</Paragraph>
      <pre style={{ backgroundColor: '#f9f0ff', padding: '16px', borderRadius: '8px', border: '1px solid #d3adf7', whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto', marginBottom: '24px' }}>
        {finalJsonData.length > 0 ? JSON.stringify(finalJsonData.slice(0, 5), null, 2) : t('result_no_successful_data')}
        {finalJsonData.length > 5 && "\n..."}
      </pre>

      <Space style={{ marginTop: '24px' }}>
        <Button onClick={onPrev}>{t('btn_back')}</Button>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleDownloadJson}
          disabled={finalJsonData.length === 0}
        >
          {t('btn_download_json')}
        </Button>
        
        <Button
            type="primary"
            icon={<FileTextOutlined />}
            onClick={handleDownloadCsv}
            disabled={finalJsonData.length === 0}
            ghost
        >
            {t('btn_download_csv')}
        </Button>
      </Space>
    </div>
  );
};

export default ResultStep;