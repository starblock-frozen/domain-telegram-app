import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Tag, 
  Button, 
  Space, 
  Checkbox, 
  message,
  Tooltip
} from 'antd';
import { 
  CopyOutlined, 
  LinkOutlined, 
  CheckOutlined,
  ShoppingCartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { formatDate } from '../utils/dateUtils';

const { Text } = Typography;

const DomainCard = ({ 
  domain, 
  selected, 
  onSelect, 
  ticketStatus,
  onRequestBuy 
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text) => {
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

  const openDomain = () => {
    window.open(`https://${domain.domainName}`, '_blank');
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

  const buttonConfig = getButtonConfig();

  return (
    <Card
      size="small"
      style={{ 
        margin: '8px 16px', 
        borderRadius: '8px',
        opacity: domain.status ? 1 : 0.7
      }}
      bodyStyle={{ padding: '12px' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 8 }}>
        <Checkbox 
          checked={selected} 
          onChange={(e) => onSelect(domain.id, e.target.checked)}
          style={{ marginRight: 8, marginTop: 2 }}
          disabled={!domain.status} // Disable checkbox for sold domains
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <Text 
              strong 
              style={{ 
                color: '#1890ff', 
                fontSize: '16px',
                textDecoration: domain.status ? 'none' : 'line-through'
              }}
            >
              {domain.domainName}
            </Text>
            <Space style={{ marginLeft: 8 }}>
              <Tooltip title={copied ? 'Copied!' : 'Copy domain'}>
                <Button
                  type="text"
                  size="small"
                  icon={copied ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined />}
                  onClick={() => copyToClipboard(domain.domainName)}
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
            </Space>
          </div>
          
          <Space wrap style={{ marginBottom: 8 }}>
            <Tag color="blue">{domain.country}</Tag>
            <Tag color={
              domain.category === 'GOV' ? 'blue' :
              domain.category === 'EDU' ? 'green' :
              domain.category === 'eCommerce' ? 'orange' : 'purple'
            }>
              {domain.category}
            </Tag>
            <Tag color={domain.status ? 'success' : 'error'}>
              {domain.status ? 'Available' : 'Sold'}
            </Tag>
          </Space>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr 1fr 1fr', 
            gap: '8px',
            marginBottom: 8
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

          {domain.postDateTime && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Posted: {formatDate(domain.postDateTime)}
            </Text>
          )}
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingTop: 8,
        borderTop: '1px solid #303030'
      }}>
        <Text strong style={{ color: '#52c41a', fontSize: '18px' }}>
          ${(domain.price || 0).toLocaleString()}
        </Text>
        <Button
          {...buttonConfig}
          size="small"
          onClick={() => onRequestBuy([domain])}
          disabled={buttonConfig.disabled || !domain.status}
        >
          {buttonConfig.text}
        </Button>
      </div>
    </Card>
  );
};

export default DomainCard;
