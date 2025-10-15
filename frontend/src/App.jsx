import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Steps, Layout, Typography, App as AntdApp } from 'antd';
import UploadStep from './pages/UploadStep';
import PreviewStep from './pages/PreviewStep';
import MappingStep from './pages/MappingStep';
import SummaryStep from './pages/SummaryStep';
import ResultStep from './pages/ResultStep';

const { Header, Content } = Layout;
const { Title } = Typography;

const App = () => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [fileInfo, setFileInfo] = useState(null);
  const [importType, setImportType] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [mappingResult, setMappingResult] = useState(null);
  const [validationResults, setValidationResults] = useState([]);

  const next = () => setCurrent(current + 1);
  const prev = () => setCurrent(current - 1);

  const handleUploadSuccess = (data, type) => {
    setFileInfo(data);
    setImportType(type);
  };

  const steps = [
    {
      title: t('steps_upload'),
      content: <UploadStep onNext={next} onUploadSuccess={handleUploadSuccess} />,
    },
    {
      title: t('steps_preview'),
      content: <PreviewStep onNext={next} onPrev={prev} fileInfo={fileInfo} onPreviewData={setPreviewData} />,
    },
    {
      title: t('steps_mapping'),
      content: (
        <MappingStep
          onNext={next}
          onPrev={prev}
          data={previewData}
          importType={importType}
          onMappingComplete={setMappingResult}
          onValidationComplete={setValidationResults}
          validationResults={validationResults} 
        />
      ),
    },
    {
      title: t('steps_summary'),
      content: <SummaryStep onNext={next} onPrev={prev} mappingResult={mappingResult} />,
    },
    {
      title: t('steps_result'),
      content: <ResultStep onPrev={prev} validationResults={validationResults} />,
    },
  ];

  const items = steps.map((item) => ({ key: item.title, title: item.title }));

  return (
    <AntdApp>
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
        <Header style={{ display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', borderBottom: '1px solid #f0f0f0' }}>
          <Title level={3} style={{ color: '#722ED1', margin: 0 }}>{t('app_title')}</Title>
        </Header>
        <Content style={{ padding: '24px 50px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '1000px' }}>
            <Steps current={current} items={items} style={{ marginBottom: '40px' }} />
            <div style={{ marginTop: '24px', backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              {steps[current].content}
            </div>
          </div>
        </Content>
      </Layout>
    </AntdApp>
  );
};

export default App;