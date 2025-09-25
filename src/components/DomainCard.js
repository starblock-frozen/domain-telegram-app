import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Tag, 
  Button, 
  Space, 
  Checkbox, 
  message,
  Tooltip,
  Badge
} from 'antd';
import { 
  CopyOutlined, 
  LinkOutlined, 
  CheckOutlined,
  ShoppingCartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DownOutlined,
  UpOutlined
} from '@ant-design/icons';
import { formatDate, isToday, isYesterday } from '../utils/dateUtils';

const { Text } = Typography;

const DomainCard = ({ 
  domain, 
  selected, 
  onSelect, 
  ticketStatus,
  onRequestBuy,
  onCardClick 
}) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const copyToClipboard = async (text, e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      message.success('Domain copied to clipboard!');
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      message.error('Failed to copy to clipboard');
    }
  };

  const openDomain = (e) => {
    e.stopPropagation();
    window.open(`https://${domain.domainName}`, '_blank');
  };

  const handleExpandClick = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onSelect(domain.id, e.target.checked);
  };

  const handleRequestClick = (e) => {
    e.stopPropagation();
    onRequestBuy([domain]);
  };

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(domain.id);
    }
  };

    const getButtonConfig = () => {
    switch (ticketStatus) {
      case 'Sold':
        return {
          text: 'Bought',
          type: 'primary',
          icon: <CheckCircleOutlined />,
          disabled: true,
          style: { backgroundColor: '#52c41a', borderColor: '#52c41a' }
        };
      case 'New':
      case 'Read':
        return {
          text: 'Requested',
          type: 'default',
          icon: <ClockCircleOutlined />,
          disabled: true,
          style: { color: '#faad14', borderColor: '#faad14' }
        };
      default:
        return {
          text: 'Request to Buy',
          type: 'primary',
          icon: <ShoppingCartOutlined />,
          disabled: false,
          style: {}
        };
    }
  };

  const getPostedText = () => {
    if (!domain.postDateTime) return '';
    
    if (isToday(domain.postDateTime)) {
      return 'Posted: Today';
    } else if (isYesterday(domain.postDateTime)) {
      return 'Posted: Yesterday';
    } else {
      return `Posted: ${formatDate(domain.postDateTime)}`;
    }
  };

  const getTypeColor = (type) => {
    const typeColors = {
      'cPanel': '#1890ff',
      'Plesk': '#52c41a',
      'DirectAdmin': '#faad14',
      'VestaCP': '#722ed1',
      'Webshell': '#ff4d4f',
      'WHM': '#13c2c2',
      'Shell': '#ff4d4f'
    };
    return typeColors[type] || '#666666';
  };

  const buttonConfig = getButtonConfig();
  const isNewDomain = domain.postDateTime && isToday(domain.postDateTime);

  const renderFirstLine = () => (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 8,
      marginBottom: 4
    }}>
      <Checkbox 
        checked={selected} 
        onChange={handleCheckboxClick}
        disabled={!domain.status}
        onClick={handleCheckboxClick}
      />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
        {isNewDomain && (
          <Badge 
            count="NEW" 
            style={{ 
              backgroundColor: '#ff4d4f',
              color: '#fff',
              fontSize: '9px',
              padding: '0 4px',
              borderRadius: '8px',
              height: '16px',
              lineHeight: '16px',
              fontWeight: 'bold'
            }}
          />
        )}
        <Text 
          strong 
          style={{ 
            color: '#1890ff', 
            fontSize: '16px',
            textDecoration: domain.status ? 'none' : 'line-through',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1
          }}
        >
          {domain.domainName}
        </Text>
      </div>

      <Space size="small">
        <Tooltip title={copied ? 'Copied!' : 'Copy domain'}>
          <Button
            type="text"
            size="small"
            icon={copied ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined />}
            onClick={(e) => copyToClipboard(domain.domainName, e)}
          />
        </Tooltip>
        <Tooltip title="Visit domain">
          <Button
            type="text"
            size="small"
            icon={<LinkOutlined />}
            onClick={openDomain}
          />
        </Tooltip>
        <Button
          type="text"
          size="small"
          icon={expanded ? <UpOutlined /> : <DownOutlined />}
          onClick={handleExpandClick}
        />
      </Space>
    </div>
  );

  const renderExpandedContent = () => (
    <div style={{ 
      padding: '8px 0',
      borderTop: '1px solid #303030',
      borderBottom: '1px solid #303030',
      backgroundColor: '#0f0f0f',
      margin: '4px -12px'
    }}>
      <div style={{ padding: '0 12px' }}>
        <Space wrap style={{ marginBottom: 8 }}>
          <Tag color="blue">{domain.country}</Tag>
          <Tag color={
            domain.category === 'GOV' ? 'blue' :
            domain.category === 'EDU' ? 'green' :
            domain.category === 'eCommerce' ? 'orange' :
            domain.category === 'NEWS' ? 'red' : 'purple'
          }>
            {domain.category}
          </Tag>
          <Tag color={getTypeColor(domain.type || 'Shell')}>
            {domain.type || 'Shell'}
          </Tag>
          <Tag color={domain.status ? 'success' : 'error'}>
            {domain.status ? 'Available' : 'Sold'}
          </Tag>
        </Space>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1fr 1fr', 
          gap: '8px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>DA</Text>
            <Text strong style={{ color: domain.da >= 30 ? '#52c41a' : domain.da >= 10 ? '#faad14' : '#ff4d4f' }}>
              {domain.da || 0}
            </Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>PA</Text>
            <Text strong style={{ color: domain.pa >= 30 ? '#52c41a' : domain.pa >= 10 ? '#faad14' : '#ff4d4f' }}>
              {domain.pa || 0}
            </Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>SS</Text>
            <Text strong style={{ color: domain.ss <= 10 ? '#52c41a' : domain.ss <= 30 ? '#faad14' : '#ff4d4f' }}>
              {domain.ss || 0}
            </Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Backlinks</Text>
            <Text strong>{(domain.backlink || 0).toLocaleString()}</Text>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecondLine = () => (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      gap: 8
    }}>
      <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
        ${(domain.displayPrice || domain.price || 0).toLocaleString()}
      </Text>
      
      <Text type="secondary" style={{ fontSize: '12px', flex: 1, textAlign: 'center' }}>
        {getPostedText()}
      </Text>
      
      <Button
        {...buttonConfig}
        size="small"
        onClick={handleRequestClick}
        disabled={buttonConfig.disabled || !domain.status}
      >
        {buttonConfig.text}
      </Button>
    </div>
  );

  return (
    <Card
      size="small"
      style={{ 
        margin: '4px 16px', 
        borderRadius: '8px',
        opacity: domain.status ? 1 : 0.7,
        cursor: domain.status ? 'pointer' : 'default'
      }}
      bodyStyle={{ padding: '12px' }}
      onClick={domain.status ? handleCardClick : undefined}
      className={domain.status ? 'clickable-domain-card' : ''}
    >
      {renderFirstLine()}
      {expanded && renderExpandedContent()}
      {renderSecondLine()}
    </Card>
  );
};

export default DomainCard;
