import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Table, Select, Typography, Space, message, Alert, List, Tag, Upload, Input } from 'antd';
import { SaveOutlined, FolderOpenOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const mappingOptions = {
    contact: [
        { value: 'us.external_id', label: 'External ID' },
        { value: 'first_name', label: 'First Name' },
        { value: 'last_name', label: 'Last Name' },
        { value: 'email', label: 'Email (Required)' },
        { value: 'phone', label: 'Phone (Required)' },
        { value: 'emails', label: 'Emails (Use space to separate)' },
        { value: 'phones', label: 'Phones (Use space to separate)' },
        { value: 'organization', label: 'Organization' },
        { value: 'language', label: 'Language' },
        { value: 'tags', label: 'Tags (Use space to separate)' },
        { value: 'groups', label: 'Groups (Use space to separate)' },
        { value: 'role', label: 'Role' },
        { value: 'enabled', label: 'Enabled' },
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
        { value: 'tags', label: 'Tags (Use space to separate)' },
    ],
    organization: [
        { value: 'os.external_id', label: 'Organization External ID' },
        { value: 'name', label: 'Name (Required)' },
        { value: 'description', label: 'Description' },
        { value: 'details', label: 'Details' },
        { value: 'notes', label: 'Notes' },
        { value: 'group', label: 'Group' },
        { value: 'domains', label: 'Domains (Use space to separate)' },
        { value: 'tags', label: 'Tags (Use space to separate)' },
    ],
};

const MappingStep = ({ onNext, onPrev, data, importType, onMappingComplete, onValidationComplete, validationResults = [] }) => {
    const { t } = useTranslation();
    const [columnData, setColumnData] = useState([]);
    const [selectedMapping, setSelectedMapping] = useState({});
    const [loading, setLoading] = useState(false);
    const [customFieldValues, setCustomFieldValues] = useState({});

    useEffect(() => {
        if (!data || !data.data) return;

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

        if (isHeader) {
            const initialMappings = {};
            const normalize = (str) => String(str).toLowerCase().replace(/[\s_-]/g, '');
            const availableOptions = mappingOptions[importType] || [];

            headers.forEach((header, index) => {
                const normalizedHeader = normalize(header);
                const matchedOption = availableOptions.find(opt => {
                    const normLabel = normalize(opt.label.split('(')[0]);
                    const normValue = normalize(opt.value);
                    return normLabel === normalizedHeader || normValue === normalizedHeader;
                });
                if (matchedOption) {
                    initialMappings[index.toString()] = matchedOption.value;
                }
            });
            setSelectedMapping(initialMappings);
        }
    }, [data, importType, t]);
    
    const requiredFields = { contact: ['email', 'phone'], ticket: ['subject', 'creator', 'requester', 'status'], organization: ['name'] };
    
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

        if (hasMappingErrors() && !forceNext) {
            setLoading(false); 
            return;
        }

        const rawData = (data.isHeader && data.data.length > 1) ? data.data.slice(1) : data.data;
        const formattedData = rawData.map(row => 
            row.reduce((acc, cell, index) => {
                acc[index.toString()] = String(cell ?? ''); return acc;
            }, {})
        );

        const finalMapping = Object.entries(selectedMapping).reduce((acc, [key, value]) => {
            if (value === 'do_not_import') return acc;
            if (value === 'custom_field') {
                const customValue = customFieldValues[key];
                if (customValue && customValue.trim()) {
                    acc[key] = customValue.trim();
                }
            } else {
                acc[key] = value;
            }
            return acc;
        }, {});

        try {
            const response = await fetch('http://localhost:7000/api/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ importType, data: formattedData, mapping: finalMapping }),
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(JSON.parse(errorText)?.error || 'An unknown server error occurred.');
            }
            const results = await response.json();
            onValidationComplete(results);
            
            const hasDataErrors = results.some(r => r.status === 'hatalı');
            if (hasDataErrors && !forceNext) {
                setLoading(false); return;
            }

            onMappingComplete({ mappedFields: finalMapping, totalRows: rawData.length, errors: results.filter(r => r.status === 'hatalı') });
            onNext();
        } catch (error) { 
            console.error('Validation error:', error);
            message.error(`Validation failed: ${error.message}`);
        } 
        finally { setLoading(false); }
    }, [data, importType, selectedMapping, customFieldValues, onNext, onMappingComplete, onValidationComplete, hasMappingErrors, t]);

    const handleMappingChange = (columnIndex, field) => {
        setSelectedMapping(prev => ({ ...prev, [columnIndex]: field }));
        onValidationComplete([]);
    };

    const handleCustomFieldChange = (columnIndex, value) => {
        setCustomFieldValues(prev => ({ ...prev, [columnIndex]: value }));
    };

    const handleSaveTemplate = () => {
        const blob = new Blob([JSON.stringify(selectedMapping, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `grispi-mapping-template-${importType}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleLoadTemplate = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                setSelectedMapping(json);
                message.success(t('template_load_success'));
            } catch (error) {
                message.error(t('template_load_error'));
            }
        };
        reader.readAsText(file);
        return false;
    };
    
    const handleNext = () => runValidationAndProceed(false);
    const handleForceNext = () => runValidationAndProceed(true);
    
    const currentMappingOptions = [
        ...(mappingOptions[importType] || []),
        { type: 'divider' },
        { value: 'custom_field', label: t('custom_field_option') },
        { value: 'do_not_import', label: 'Do not import this column' }
    ];

    if (!data || !data.data) { return <Alert message={t('no_data_for_mapping')} type="warning" />; }
    const isMappingMissing = hasMappingErrors();
    const dataErrors = validationResults.filter(r => r.status === 'hatalı');
    
    return (
        <div>
            <Title level={3} style={{ color: '#722ED1' }}>{t('mapping_step_title')}</Title>
            
            {isMappingMissing && ( <Alert message={t('mapping_error_title')} description={importType === 'contact' ? t('mapping_error_contact_desc') : t('mapping_error_generic_desc', { importType })} type="error" showIcon style={{ marginBottom: 20 }}/>)}
            {dataErrors.length > 0 && ( <Alert message={t('validation_error_title')} description={<div><p dangerouslySetInnerHTML={{ __html: t('validation_error_desc_intro', { count: dataErrors.length }) }} /><List size="small" dataSource={dataErrors.slice(0, 5)} renderItem={item => (<List.Item style={{ padding: '4px 0', border: 'none' }}><Tag color="error">{t('row_label', { rowNumber: item.rowNumber })}</Tag> <Text type="danger">{item.errors.join(', ')}</Text></List.Item>)} style={{ marginBottom: '10px' }}/><p>{t('validation_error_desc_outro')}</p></div>} type="warning" showIcon style={{ marginTop: '16px' }}/>)}
            
            <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Upload beforeUpload={handleLoadTemplate} showUploadList={false}>
                    <Button icon={<FolderOpenOutlined />}>{t('btn_load_template')}</Button>
                </Upload>
                <Button icon={<SaveOutlined />} onClick={handleSaveTemplate} type="primary" ghost>
                    {t('btn_save_template')}
                </Button>
            </Space>

            <Table
                dataSource={columnData}
                pagination={false}
                bordered
                columns={[
                    { title: t('column_name'), dataIndex: 'header', key: 'header', width: '25%' },
                    { title: t('sample_1'), dataIndex: 'sample1', key: 'sample1', width: '25%' },
                    { title: t('sample_2'), dataIndex: 'sample2', key: 'sample2', width: '25%' },
                    {
                        title: t('grispi_field'),
                        dataIndex: 'key',
                        key: 'grispi_field',
                        width: '25%',
                        render: (key) => {
                            const isCustom = selectedMapping[key] === 'custom_field';
                            return (
                                <Space.Compact style={{ width: '100%' }}>
                                    <Select
                                        placeholder={t('select_placeholder')}
                                        onChange={(value) => handleMappingChange(key, value)}
                                        style={{ width: isCustom ? '50%' : '100%' }}
                                        value={selectedMapping[key]}
                                    >
                                        {currentMappingOptions.map((option, index) => 
                                            option.type === 'divider' 
                                            ? <Select.Divider key={`divider-${index}`} />
                                            : <Option key={option.value} value={option.value}>
                                                {option.label}
                                              </Option>
                                        )}
                                    </Select>
                                    {isCustom && (
                                        <Input
                                            value={customFieldValues[key] || ''}
                                            onChange={(e) => handleCustomFieldChange(key, e.target.value)}
                                            placeholder={t('custom_field_placeholder')}
                                            style={{ width: '50%' }}
                                        />
                                    )}
                                </Space.Compact>
                            );
                        },
                    },
                ]}
            />

            <Space style={{ marginTop: '24px' }}>
                <Button onClick={onPrev}>{t('btn_back')}</Button>
                <Button 
                    type="primary" 
                    onClick={handleNext} 
                    disabled={loading || isMappingMissing || dataErrors.length > 0}
                >
                    {loading ? t('btn_validating') : t('btn_continue')}
                </Button>
                {/* ## 2. DEĞİŞİKLİK: "Yine de Devam Et" butonunun görünme koşulu güncellendi. */}
                {(isMappingMissing || dataErrors.length > 0) && (
                    <Button 
                        type="primary" 
                        onClick={handleForceNext} 
                        style={{ backgroundColor: '#FF8A00', borderColor: '#FF8A00' }} 
                        disabled={loading}
                    >
                        {loading ? t('btn_validating') : t('btn_proceed_anyway')}
                    </Button>
                )}
            </Space>
        </div>
    );
};

export default MappingStep;