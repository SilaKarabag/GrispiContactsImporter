import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Table, Select, Typography, Space, message, Alert, List, Tag } from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;

// ## GÜNCELLENDİ: Ticket ve Organization için tüm alanlar eklendi ##
const mappingOptions = {
    contact: [
        { value: 'us.external_id', label: 'External ID' },
        { value: 'first_name', label: 'First Name' },
        { value: 'last_name', label: 'Last Name' },
        { value: 'email', label: 'Email (Required)' },
        { value: 'phone', label: 'Phone (Required)' },
        { value: 'emails', label: 'Emails (space separated)' },
        { value: 'phones', label: 'Phones (space separated)' },
        { value: 'organization', label: 'Organization' },
        { value: 'language', label: 'Language' },
        { value: 'tags', label: 'Tags (space separated)' },
        { value: 'groups', label: 'Groups (space separated)' },
        { value: 'role', label: 'Role' },
        { value: 'enabled', label: 'Enabled' },
        { value: 'do_not_import', label: 'Do not import this column' }
    ],
    ticket: [
        { value: 'ts.external_id', label: 'Ticket External ID' },
        { value: 'subject', label: 'Subject (Required)' },
        { value: 'description', label: 'Description' },
        { value: 'creator', label: 'Creator (Required)' },
        { value: 'requester', label: 'Requester (Required)' },
        { value: 'status', label: 'Status (Required)' },
        { value: 'assignee', label: 'Assignee' },
        { value: 'assignee_group', label: 'Assignee Group' },
        { value: 'channel', label: 'Channel' },
        { value: 'type', label: 'Type' },
        { value: 'priority', label: 'Priority' },
        { value: 'form', label: 'Form' },
        { value: 'created_at', label: 'Created At' },
        { value: 'updated_at', label: 'Updated At' },
        { value: 'solved_at', label: 'Solved At' },
        { value: 'tags', label: 'Tags (space separated)' },
        { value: 'do_not_import', label: 'Do not import this column' }
    ],
    organization: [
        { value: 'os.external_id', label: 'Organization External ID' },
        { value: 'name', label: 'Name (Required)' },
        { value: 'description', label: 'Description' },
        { value: 'details', label: 'Details' },
        { value: 'notes', label: 'Notes' },
        { value: 'group', label: 'Group' },
        { value: 'domains', label: 'Domains (space separated)' },
        { value: 'tags', label: 'Tags (space separated)' },
        { value: 'do_not_import', label: 'Do not import this column' }
    ],
};

const MappingStep = ({ onNext, onPrev, data, importType, onMappingComplete, onValidationComplete, validationResults = [] }) => {
    // BU BİLEŞENİN GERİ KALANI TAMAMEN AYNI, DEĞİŞİKLİK YOK
    const { t } = useTranslation();
    const [columnData, setColumnData] = useState([]);
    const [selectedMapping, setSelectedMapping] = useState({});
    const [loading, setLoading] = useState(false);
    
    const requiredFields = {
        contact: ['email', 'phone'], 
        ticket: ['subject', 'creator', 'requester', 'status'], 
        organization: ['name']
    };

    const hasMappingErrors = useCallback(() => {
        const mappedValues = Object.values(selectedMapping);
        if (importType === 'contact') {
            return !(mappedValues.includes('email') || mappedValues.includes('phone'));
        }
        const currentRequiredFields = requiredFields[importType] || [];
        return currentRequiredFields.some(field => !mappedValues.includes(field));
    }, [selectedMapping, importType]);

    const runValidationAndProceed = useCallback(async (forceNext = false) => {
        setLoading(true);
        onValidationComplete([]); 

        if (hasMappingErrors()) {
            setLoading(false);
            return; 
        }

        const rawData = (data.isHeader && data.data.length > 1) ? data.data.slice(1) : data.data;
        
        const formattedData = rawData.map(row => 
            row.reduce((acc, cell, index) => {
                acc[index.toString()] = String(cell ?? ''); 
                return acc;
            }, {})
        );

        try {
            const filteredMapping = Object.fromEntries(
                Object.entries(selectedMapping).filter(([, value]) => value !== 'do_not_import')
            );
            
            const response = await fetch('http://localhost:7000/api/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    importType: importType,
                    data: formattedData,
                    mapping: filteredMapping,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(JSON.parse(errorText)?.error || 'An unknown server error occurred.');
            }

            const results = await response.json();
            onValidationComplete(results); 
            
            const hasDataErrors = results.some(result => result.status === 'hatalı');
            
            if (hasDataErrors && !forceNext) {
                setLoading(false);
                return; 
            }

            onMappingComplete({
                mappedFields: filteredMapping,
                totalRows: rawData.length,
                errors: results.filter(r => r.status === 'hatalı'),
            });
            onNext();

        } catch (error) {
            console.error('Validation error:', error);
            message.error(`Validation failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [data, importType, selectedMapping, onNext, onMappingComplete, onValidationComplete, hasMappingErrors, t]);

    useEffect(() => {
        if (data && data.data) {
            const { data: rawData, isHeader } = data;
            const headers = isHeader && rawData.length > 0 ? rawData[0] : (rawData.length > 0 ? rawData[0].map((_, i) => t('preview_default_column_name', { index: i + 1 })) : []);
            const sampleRows = isHeader ? rawData.slice(1, 3) : rawData.slice(0, 2);
            const columns = headers.map((header, index) => ({
                header: String(header ?? ''),
                sample1: String(sampleRows[0]?.[index] ?? ''),
                sample2: String(sampleRows[1]?.[index] ?? ''),
                key: index.toString(),
            }));
            setColumnData(columns);
        }
    }, [data, t]);

    const handleMappingChange = (columnIndex, field) => {
        setSelectedMapping(prev => ({ ...prev, [columnIndex]: field }));
        onValidationComplete([]);
    };

    const handleNext = () => runValidationAndProceed(false);
    const handleForceNext = () => runValidationAndProceed(true);
    
    if (!data || !data.data) {
        return <Alert message={t('no_data_for_mapping')} type="warning" />;
    }

    const isMappingMissing = hasMappingErrors();
    const dataErrors = validationResults.filter(r => r.status === 'hatalı');

    return (
        <div>
            <Title level={3} style={{ color: '#722ED1' }}>{t('mapping_step_title')}</Title>
            
            {isMappingMissing && (
                <Alert
                    message={t('mapping_error_title')}
                    description={importType === 'contact' 
                        ? t('mapping_error_contact_desc')
                        : t('mapping_error_generic_desc', { importType })
                    }
                    type="error" showIcon style={{ marginBottom: 20 }}
                />
            )}
            
            {dataErrors.length > 0 && (
                <Alert
                    message={t('validation_error_title')}
                    description={
                        <div>
                            <p dangerouslySetInnerHTML={{ __html: t('validation_error_desc_intro', { count: dataErrors.length }) }} />
                            <List
                                size="small"
                                dataSource={dataErrors.slice(0, 5)}
                                renderItem={item => (
                                    <List.Item style={{ padding: '4px 0', border: 'none' }}>
                                       <Tag color="error">{t('row_label', { rowNumber: item.rowNumber })}</Tag> 
                                       <Text type="danger">{item.errors.join(', ')}</Text>
                                    </List.Item>
                                )}
                                style={{ marginBottom: '10px' }}
                            />
                            {dataErrors.length > 5 && (
                                <p style={{ fontStyle: 'italic', color: '#888' }}>
                                    {t('validation_error_and_other', { count: dataErrors.length - 5 })}
                                </p>
                            )}
                            <p>{t('validation_error_desc_outro')}</p>
                        </div>
                    }
                    type="warning" showIcon style={{ marginTop: '16px' }}
                />
            )}
            
            <Table
                dataSource={columnData} pagination={false} bordered
                columns={[
                    { title: t('column_name'), dataIndex: 'header', key: 'header' },
                    { title: t('sample_1'), dataIndex: 'sample1', key: 'sample1' },
                    { title: t('sample_2'), dataIndex: 'sample2', key: 'sample2' },
                    {
                        title: t('grispi_field'), dataIndex: 'key', key: 'grispi_field',
                        render: (key) => (
                            <Select
                                placeholder={t('select_placeholder')}
                                onChange={(value) => handleMappingChange(key, value)}
                                style={{ width: '100%' }}
                                value={selectedMapping[key]}
                            >
                                {(mappingOptions[importType] || []).map(option => (
                                    <Option key={option.value} value={option.value}>{option.label}</Option>
                                ))}
                            </Select>
                        ),
                    },
                ]}
            />

            <Space style={{ marginTop: '24px' }}>
                <Button onClick={onPrev}>{t('btn_back')}</Button>
                <Button type="primary" onClick={handleNext} disabled={loading || isMappingMissing || dataErrors.length > 0}>
                    {loading ? t('btn_validating') : t('btn_continue')}
                </Button>
                {dataErrors.length > 0 && !isMappingMissing && (
                    <Button type="primary" onClick={handleForceNext} style={{ backgroundColor: '#FF8A00', borderColor: '#FF8A00' }} disabled={loading}>
                        {loading ? t('btn_validating') : t('btn_proceed_anyway')}
                    </Button>
                )}
            </Space>
        </div>
    );
};

export default MappingStep;