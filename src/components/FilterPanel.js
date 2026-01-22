import React from 'react';
import {
  Button,
  Select,
  Typography,
  InputNumber,
  Row,
  Col
} from 'antd';
import { ClearOutlined, CloseOutlined, DollarOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography;

const FilterPanel = ({ 
  visible, 
  filters, 
  onFilterChange, 
  onClearFilters, 
  domains,
  onClose 
}) => {
  const categories = ['GOV', 'EDU', 'NEWS', 'eCommerce', 'Commerce'];
  const countries = [...new Set(domains.map(domain => domain.country))].filter(Boolean).sort();
  
  // Extract unique domain types from domains
  const domainTypes = [...new Set(domains.map(domain => domain.type || 'Shell'))].filter(Boolean).sort();

  const handleFilterChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const handleRangeChange = (type, field, value) => {
    const currentRange = filters[type];
    const newRange = [...currentRange];
    
    if (field === 'min') {
      newRange[0] = value || 0;
      if (newRange[0] > newRange[1]) {
        newRange[1] = newRange[0];
      }
    } else {
      newRange[1] = value || 0;
      if (newRange[1] < newRange[0]) {
        newRange[0] = newRange[1];
      }
    }
    
    handleFilterChange(type, newRange);
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="filter-backdrop" onClick={onClose} />
      
      {/* Filter Panel */}
      <div className="filter-panel-container">
        <div className="filter-panel-content">
          {/* Header */}
          <div className="filter-panel-header">
            <Text strong className="filter-panel-title">
              Filters
            </Text>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button 
                size="small" 
                icon={<ClearOutlined />} 
                onClick={onClearFilters}
                className="filter-clear-btn"
              >
                Clear
              </Button>
              <Button 
                size="small" 
                type="text"
                icon={<CloseOutlined />} 
                onClick={onClose}
                className="filter-close-btn"
              />
            </div>
          </div>

          {/* Filter Body */}
          <div className="filter-panel-body">
            {/* Countries & Categories */}
            <Row gutter={[12, 16]}>
              <Col span={12}>
                <div className="filter-group">
                  <Text className="filter-label">Countries</Text>
                  <Select
                    mode="multiple"
                    placeholder="Select countries"
                    value={filters.countries}
                    onChange={(value) => handleFilterChange('countries', value)}
                    className="filter-select"
                    allowClear
                    maxTagCount={1}
                    getPopupContainer={(trigger) => trigger.parentNode}
                  >
                    {countries.map(country => (
                      <Option key={country} value={country}>
                        {country}
                      </Option>
                    ))}
                  </Select>
                </div>
              </Col>

              <Col span={12}>
                <div className="filter-group">
                  <Text className="filter-label">Categories</Text>
                  <Select
                    mode="multiple"
                    placeholder="Select categories"
                    value={filters.categories}
                    onChange={(value) => handleFilterChange('categories', value)}
                    className="filter-select"
                    allowClear
                    maxTagCount={1}
                    getPopupContainer={(trigger) => trigger.parentNode}
                  >
                    {categories.map(category => (
                      <Option key={category} value={category}>
                        {category}
                      </Option>
                    ))}
                  </Select>
                </div>
              </Col>
            </Row>

            {/* Domain Types */}
            <div className="filter-group">
              <Text className="filter-label">Domain Types</Text>
              <Select
                mode="multiple"
                placeholder="Select domain types"
                value={filters.domainTypes}
                onChange={(value) => handleFilterChange('domainTypes', value)}
                className="filter-select"
                allowClear
                maxTagCount={2}
                getPopupContainer={(trigger) => trigger.parentNode}
              >
                {domainTypes.map(type => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Sort By */}
            <div className="filter-group">
              <Text className="filter-label">Sort By</Text>
              <Select
                value={filters.sortBy}
                onChange={(value) => handleFilterChange('sortBy', value)}
                className="filter-select"
                getPopupContainer={(trigger) => trigger.parentNode}
              >
                <Option value="newest">Newest to Oldest</Option>
                <Option value="oldest">Oldest to Newest</Option>
                <Option value="da_high">DA (High to Low)</Option>
                <Option value="da_low">DA (Low to High)</Option>
                <Option value="price_high">Price (High to Low)</Option>
                <Option value="price_low">Price (Low to High)</Option>
              </Select>
            </div>

            {/* DA Range */}
            <div className="filter-group">
              <Text className="filter-label">
                Domain Authority: {filters.daRange[0]} - {filters.daRange[1]}
              </Text>
              <div className="range-input-group">
                <InputNumber
                  min={0}
                  max={100}
                  value={filters.daRange[0]}
                  onChange={(value) => handleRangeChange('daRange', 'min', value)}
                  className="range-input"
                  placeholder="Min"
                />
                <span className="range-separator">—</span>
                <InputNumber
                  min={0}
                  max={100}
                  value={filters.daRange[1]}
                  onChange={(value) => handleRangeChange('daRange', 'max', value)}
                  className="range-input"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* PA Range */}
            <div className="filter-group">
              <Text className="filter-label">
                Page Authority: {filters.paRange[0]} - {filters.paRange[1]}
              </Text>
              <div className="range-input-group">
                <InputNumber
                  min={0}
                  max={100}
                  value={filters.paRange[0]}
                  onChange={(value) => handleRangeChange('paRange', 'min', value)}
                  className="range-input"
                  placeholder="Min"
                />
                <span className="range-separator">—</span>
                <InputNumber
                  min={0}
                  max={100}
                  value={filters.paRange[1]}
                  onChange={(value) => handleRangeChange('paRange', 'max', value)}
                  className="range-input"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* SS Range */}
            <div className="filter-group">
              <Text className="filter-label">
                Spam Score: {filters.ssRange[0]} - {filters.ssRange[1]}
              </Text>
              <div className="range-input-group">
                <InputNumber
                  min={0}
                  max={100}
                  value={filters.ssRange[0]}
                  onChange={(value) => handleRangeChange('ssRange', 'min', value)}
                  className="range-input"
                  placeholder="Min"
                />
                <span className="range-separator">—</span>
                <InputNumber
                  min={0}
                  max={100}
                  value={filters.ssRange[1]}
                  onChange={(value) => handleRangeChange('ssRange', 'max', value)}
                  className="range-input"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Price Range */}
            <div className="filter-group">
              <Text className="filter-label">
                Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
              </Text>
              <div className="range-input-group">
                <InputNumber
                  min={0}
                  max={10000}
                  value={filters.priceRange[0]}
                  onChange={(value) => handleRangeChange('priceRange', 'min', value)}
                  className="range-input price-input"
                  placeholder="Min"
                  prefix={<DollarOutlined className="dollar-icon" />}
                />
                <span className="range-separator">—</span>
                <InputNumber
                  min={0}
                  max={10000}
                  value={filters.priceRange[1]}
                  onChange={(value) => handleRangeChange('priceRange', 'max', value)}
                  className="range-input price-input"
                  placeholder="Max"
                  prefix={<DollarOutlined className="dollar-icon" />}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterPanel;
