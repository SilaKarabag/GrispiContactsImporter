import React, { useMemo } from 'react';
import { Button, Typography, Space, notification, Alert, Card, Statistic, List, Tag } from 'antd';
import { DownloadOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const ResultStep = ({ mappingResult, fileInfo, importType, onPrev }) => {
  const { mappedFields, totalRows } = mappingResult || {};

  const { successfulRows, failedRows, finalJsonData } = useMemo(() => {
    if (!mappingResult || !fileInfo || !fileInfo.length) {
      return { successfulRows: [], failedRows: [], finalJsonData: null };
    }

    const [headerRow, ...dataRows] = fileInfo;
    const successful = [];
    const failed = [];
    const transformedData = [];

    const mappedFieldsKeys = Object.keys(mappedFields).filter(key => mappedFields[key] !== 'Do not import this column');

    dataRows.forEach((row, index) => {
      let isRowValid = true;
      let failureReason = '';

      // Validate based on importType
      if (importType === 'contact') {
        const emailColIndex = Object.keys(mappedFields).find(key => mappedFields[key] === 'Email');
        const phoneColIndex = Object.keys(mappedFields).find(key => mappedFields[key] === 'Phone');
        
        const hasEmail = emailColIndex !== undefined && row[emailColIndex] && String(row[emailColIndex]).trim() !== '';
        const hasPhone = phoneColIndex !== undefined && row[phoneColIndex] && String(row[phoneColIndex]).trim() !== '';
        
        if (!hasEmail && !hasPhone) {
          isRowValid = false;
          failureReason = 'Email veya Phone alanlarından en az biri boş olamaz.';
        }
      } else if (importType === 'organization') {
        const nameColIndex = Object.keys(mappedFields).find(key => mappedFields[key] === 'Name');
        if (nameColIndex === undefined || !row[nameColIndex] || String(row[nameColIndex]).trim() === '') {
          isRowValid = false;
          failureReason = '"Name" alanı boş olamaz.';
        }
      } else if (importType === 'ticket') {
        const requiredTicketFields = ['Subject', 'Creator', 'Requester', 'Status'];
        for (const field of requiredTicketFields) {
          const colIndex = Object.keys(mappedFields).find(key => mappedFields[key] === field);
          if (colIndex === undefined || !row[colIndex] || String(row[colIndex]).trim() === '') {
            isRowValid = false;
            failureReason = `"${field}" alanı boş olamaz.`;
            break;
          }
        }
      }

      if (isRowValid) {
        successful.push(row);
        const obj = {};
        mappedFieldsKeys.forEach(columnIndex => {
          const grispiField = mappedFields[columnIndex];
          const value = row[parseInt(columnIndex, 10)];
          obj[grispiField] = value;
        });
        transformedData.push(obj);
      } else {
        failed.push({ row, index, reason: failureReason });
      }
    });

    return { successfulRows: successful, failedRows: failed, finalJsonData: transformedData };
  }, [mappingResult, fileInfo, importType]);

  const handleDownloadJson = () => {
    if (!finalJsonData || finalJsonData.length === 0) {
      notification.error({
        message: 'Hata',
        description: 'İndirilecek başarılı veri bulunamadı.',
      });
      return;
    }

    const jsonString = JSON.stringify(finalJsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grispi_import_success_${importType}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notification.success({
      message: 'Başarılı',
      description: 'JSON dosyası başarıyla indirildi.',
    });
  };

  const isSuccess = successfulRows.length > 0 && failedRows.length === 0;

  return (
    <div>
      <Title level={3} style={{ color: '#722ED1' }}>
        İçe Aktarma Sonucu
      </Title>

      {isSuccess ? (
        <Alert
          message="İçe Aktarma Başarılı!"
          description={`Tüm ${totalRows} satır başarılı bir şekilde doğrulandı ve içe aktarılmaya hazır.`}
          type="success"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      ) : (
        <Alert
          message="İçe Aktarma Tamamlandı (Hatalarla)"
          description={`${successfulRows.length} satır başarılı, ${failedRows.length} satır hatalı. Lütfen hatalı satırları kontrol edip düzeltin.`}
          type="warning"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      <Space size="large" style={{ marginBottom: '24px' }}>
        <Card bordered={false}>
          <Statistic
            title="Başarılı Satır Sayısı"
            value={successfulRows.length}
            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
        <Card bordered={false}>
          <Statistic
            title="Hatalı Satır Sayısı"
            value={failedRows.length}
            prefix={<CloseCircleOutlined style={{ color: '#f5222d' }} />}
            valueStyle={{ color: '#f5222d' }}
          />
        </Card>
      </Space>

      {failedRows.length > 0 && (
        <Card
          title={<Text strong>Hatalı Satırlar</Text>}
          style={{ marginBottom: '24px' }}
        >
          <List
            size="small"
            bordered
            dataSource={failedRows}
            renderItem={item => (
              <List.Item>
                <Tag color="error">Satır {item.index + 2}</Tag>
                <Text>{item.reason}</Text>
              </List.Item>
            )}
          />
        </Card>
      )}

      <Paragraph>
        Aşağıda, sadece başarılı bir şekilde eşleştirilen verilerin JSON önizlemesi bulunmaktadır.
      </Paragraph>
      <pre style={{
        backgroundColor: '#f9f0ff',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #d3adf7',
        whiteSpace: 'pre-wrap',
        maxHeight: '200px',
        overflowY: 'auto',
        marginBottom: '24px'
      }}>
        {finalJsonData && finalJsonData.length > 0 ? JSON.stringify(finalJsonData, null, 2) : 'Başarılı veri bulunamadı.'}
      </pre>

      <Space style={{ marginTop: '24px' }}>
        <Button onClick={onPrev}>Geri</Button>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleDownloadJson}
          disabled={finalJsonData.length === 0}
        >
          JSON Olarak İndir
        </Button>
      </Space>
    </div>
  );
};

export default ResultStep;