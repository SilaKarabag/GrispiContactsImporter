import React, { useState } from 'react';
import { Steps, Layout, Typography, App as AntdApp } from 'antd';
import UploadStep from './pages/UploadStep';
import PreviewStep from './pages/PreviewStep';
import MappingStep from './pages/MappingStep';
import SummaryStep from './pages/SummaryStep';
import ResultStep from './pages/ResultStep';

const { Header, Content } = Layout;
const { Title } = Typography;

const App = () => {
  const [current, setCurrent] = useState(0);
  const [importedData, setImportedData] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [mappingResult, setMappingResult] = useState(null);
  const [importType, setImportType] = useState(null);

  const next = () => setCurrent(current + 1);
  const prev = () => setCurrent(current - 1);

  const handleUploadSuccess = (data, type) => {
    setFileInfo(data);
    setImportType(type);
  };

  const steps = [
    {
      title: 'Yükleme',
      content: <UploadStep onNext={next} onUploadSuccess={handleUploadSuccess} />,
    },
    {
      title: 'Önizleme',
      content: <PreviewStep onNext={next} onPrev={prev} fileInfo={fileInfo} onPreviewData={setImportedData} />,
    },
    {
      title: 'Eşleme',
      content: <MappingStep onNext={next} onPrev={prev} data={importedData} importType={importType} onMappingComplete={setMappingResult} />,
    },
    {
      title: 'Özet',
      content: <SummaryStep onNext={next} onPrev={prev} mappingResult={mappingResult} />,
    },
    {
      title: 'Sonuç',
      content: <ResultStep onPrev={prev} mappingResult={mappingResult} fileInfo={fileInfo} importType={importType} />,
    },
  ];

  const items = steps.map((item) => ({ key: item.title, title: item.title }));

  return (
    <AntdApp>
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
        <Header style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Title level={3} style={{ color: '#722ED1', margin: 0 }}>
            Grispi Contacts Importer
          </Title>
        </Header>
        <Content style={{ padding: '0 50px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ padding: '24px', width: '100%', maxWidth: '900px' }}>
            <Steps
              current={current}
              items={items}
              style={{ marginBottom: '40px' }}
            />
            <div style={{ marginTop: '24px', backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              {steps[current].content}
            </div>
          </div>
        </Content>
      </Layout>
    </AntdApp>
  );
};

export default App;