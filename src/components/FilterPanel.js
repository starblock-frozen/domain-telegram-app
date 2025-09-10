import React from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  Slider,
  Button,
  Space,
  Typography,
  InputNumber
} from 'antd';
import { FilterOutlined, ClearOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography;

const FilterPanel = ({ 
  visible, 
  filters, 
  onFilterChange, 
  onClearFilters, 
  domains,
  onToggle 
}) => {
  const categories = ['GOV', 'EDU', 'eCommerce', 'Commerce'];
  const countries = [...new Set(domains.map(domain => domain.country))].filter(Boolean).sort();

  const handleFilterChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const handleRangeInputChange = (type, index, value) => {
    const currentRange = filters[type];
    const newRange = [...currentRange];
    newRange[index] = value || 0;
    
    if (index === 0 && newRange[0] > newRange[1]) {
      newRange[1] = newRange[0];
    } else if (index === 1 && newRange[1] < newRange[0]) {
      newRange[0] = newRange[1];
    }
    
    handleFilterChange(type, newRange);
  };

  if (!visible) {
    return (
      <div style={{ padding: '8px 16px', textAlign: 'center' }}>
        <Button 
          type="primary" 
          icon={<FilterOutlined />} 
          onClick={onToggle}
          block
        >
          Show Filters
        </Button>
      </div>
    );
  }

  return (
    <Card 
      size="small" 
      style={{ margin: '8px 16px', borderRadius: '8px' }}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong>Filters</Text>
          <Space>
            <Button 
              size="small" 
              icon={<ClearOutlined />} 
              onClick={onClearFilters}
            >
              Clear
            </Button>
            <Button 
              size="small" 
              type="text" 
              onClick={onToggle}
            >
              Hide
            </Button>
          </Space>
        </div>
      }
    >
      <Row gutter={[8, 8]}>
        <Col span={12}>
          <Text strong>Countries</Text>
          <Select
            mode="multiple"
            placeholder="Select countries"
            value={filters.countries}
            onChange={(value) => handleFilterChange('countries', value)}
            style={{ width: '100%', marginTop: 4 }}
            allowClear
            maxTagCount="responsive"
          >
            {countries.map(country => (
              <Option key={country} value={country}>
                {country}
              </Option>
            ))}
          </Select>
        </Col>

        <Col span={12}>
          <Text strong>Categories</Text>
          <Select
            mode="multiple"
            placeholder="Select categories"
            value={filters.categories}
            onChange={(value) => handleFilterChange('categories', value)}
            style={{ width: '100%', marginTop: 4 }}
            allowClear
            maxTagCount="responsive"
          >
            {categories.map(category => (
              <Option key={category} value={category}>
                {category}
              </Option>
            ))}
          </Select>
        </Col>

        <Col span={24}>
          <Text strong>DA Range: {filters.daRange[0]} - {filters.daRange[1]}</Text>
          <div style={{ marginTop: 4, marginBottom: 8 }}>
            <Row gutter={8} align="middle">
              <Col span={6}>
                <InputNumber
                  min={0}
                  max={100}
                  value={filters.daRange[0]}
                  onChange={(value) => handleRangeInputChange('daRange', 0, value)}
                  size="small"
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <Slider
                  range
                  min={0}
                  max={100}
                  value={filters.daRange}
                  onChange={(value) => handleFilterChange('daRange', value)}
                />
              </Col>
              <Col span={6}>
                <InputNumber
                  min={0}
                  max={100}
                  value={filters.daRange[1]}
                  onChange={(value) => handleRangeInputChange('daRange', 1, value)}
                  size="small"
                  style={{ width: '100%' }}
                />
              </Col>
            </Row>
          </div>
        </Col>

        <Col span={24}>
          <Text strong>PA Range: {filters.paRange[0]} - {filters.paRange[1]}</Text>
          <div style={{ marginTop: 4, marginBottom: 8 }}>
            <Row gutter={8} align="middle">
              <Col span={6}>
                <InputNumber
                  min={0}
                  max={100}
                  value={filters.paRange[0]}
                  onChange={(value) => handleRangeInputChange('paRange', 0, value)}
                  size="small"
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <Slider
                  range
                  min={0}
                  max={100}
                  value={filters.paRange}
                  onChange={(value) => handleFilterChange('paRange', value)}
                />
              </Col>
              <Col span={6}>
                <InputNumber
                  min={0}
                  max={100}
                  value={filters.paRange[1]}
                  onChange={(value) => handleRangeInputChange('paRange', 1, value)}
                  size="small"
                  style={{ width: '100%' }}
                />
              </Col>
            </Row>
          </div>
        </Col>

        <Col span={24}>
          <Text strong>SS Range: {filters.ssRange[0]} - {filters.ssRange[1]}</Text>
          <div style={{ marginTop: 4, marginBottom: 8 }}>
            <Row gutter={8} align="middle">
              <Col span={6}>
                <InputNumber
                  min={0}
                  max={100}
                  value={filters.ssRange[0]}
                  onChange={(value) => handleRangeInputChange('ssRange', 0, value)}
                  size="small"
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <Slider
                  range
                  min={0}
                  max={100}
                  value={filters.ssRange}
                  onChange={(value) => handleFilterChange('ssRange', value)}
                />
              </Col>
              <Col span={6}>
                <InputNumber
                  min={0}
                  max={100}
                  value={filters.ssRange[1]}
                  onChange={(value) => handleRangeInputChange('ssRange', 1, value)}
                  size="small"
                  style={{ width: '100%' }}
                />
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default FilterPanel;
