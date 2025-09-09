import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Space, 
  Typography, 
  message, 
  Empty,
  FloatButton,
  Modal
} from 'antd';
import { 
  DownloadOutlined, 
  CopyOutlined, 
  ShoppingCartOutlined,
  UpOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import DomainCard from './DomainCard';
import { exportDomainsToCSV } from '../utils/csvExport';

const { Text } = Typography;

const DomainList = ({ 
  domains, 
  selectedDomains, 
  onSelectionChange, 
  ticketStatuses,
  onRequestBuy 
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSelectAll = (checked) => {
    if (checked) {
      // Only select available domains
      const availableDomainIds = domains
        .filter(domain => domain.status)
        .map(domain => domain.id);
      onSelectionChange(availableDomainIds);
    } else {
      onSelectionChange([]);
    }
  };

  const handleDomainSelect = (domainId, checked) => {
    if (checked) {
      onSelectionChange([...selectedDomains, domainId]);
    } else {
      onSelectionChange(selectedDomains.filter(id => id !== domainId));
    }
  };

  const handleExportCSV = () => {
    exportDomainsToCSV(domains, 'domains.csv');
    message.success('Domains exported successfully!');
  };

  const handleCopySelected = async () => {
    const selectedDomainNames = domains
      .filter(domain => selectedDomains.includes(domain.id))
      .map(domain => domain.domainName)
      .join('\n');

    if (selectedDomainNames) {
      try {
        await navigator.clipboard.writeText(selectedDomainNames);
        message.success(`${selectedDomains.length} domains copied to clipboard!`);
      } catch (err) {
        message.error('Failed to copy domains to clipboard');
      }
    } else {
      message.warning('No domains selected');
    }
  };

  const handleRequestSelected = () => {
    const selectedDomainObjects = domains.filter(domain => 
      selectedDomains.includes(domain.id)
    );
    
    // Check for unavailable or already requested/bought domains
    const unavailableDomains = selectedDomainObjects.filter(domain => !domain.status);
    const requestedOrBoughtDomains = selectedDomainObjects.filter(domain => {
      const status = ticketStatuses[domain.domainName];
      return status === 'New' || status === 'Read' || status === 'Sold';
    });
    
    const problematicDomains = [...unavailableDomains, ...requestedOrBoughtDomains];
    
    if (problematicDomains.length > 0) {
      const soldDomains = unavailableDomains.map(d => d.domainName);
      const requestedDomains = requestedOrBoughtDomains.map(d => d.domainName);
      
      let content = '';
      if (soldDomains.length > 0) {
        content += `Sold domains: ${soldDomains.join(', ')}\n`;
      }
      if (requestedDomains.length > 0) {
        content += `Already requested/bought domains: ${requestedDomains.join(', ')}`;
      }
      
      Modal.warning({
        title: 'Cannot Request Selected Domains',
        content: content,
        okText: 'OK',
        centered: true,
        icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
      });
      return;
    }
    
    const availableSelectedDomains = selectedDomainObjects.filter(domain => 
      domain.status && !ticketStatuses[domain.domainName]
    );
    
    if (availableSelectedDomains.length > 0) {
      onRequestBuy(availableSelectedDomains);
    } else {
      message.warning('No available domains selected');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const availableDomainsCount = domains.filter(domain => domain.status).length;
  const allAvailableSelected = availableDomainsCount > 0 && 
    selectedDomains.length === availableDomainsCount &&
    selectedDomains.every(id => {
      const domain = domains.find(d => d.id === id);
      return domain && domain.status;
    });

  if (domains.length === 0) {
    return (
      <div style={{ padding: '40px 16px', textAlign: 'center' }}>
        <Empty 
          description="No domains found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Action Bar */}
      <div style={{ 
        padding: '8px 16px', 
        backgroundColor: '#141414', 
        borderBottom: '1px solid #303030',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ marginBottom: 8 }}>
          <Space wrap>
            <Button
              size="small"
              type={allAvailableSelected ? 'default' : 'primary'}
              onClick={() => handleSelectAll(!allAvailableSelected)}
            >
              {allAvailableSelected ? 'Unselect All' : 'Select All Available'}
            </Button>
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={handleCopySelected}
              disabled={selectedDomains.length === 0}
            >
              Copy Selected ({selectedDomains.length})
            </Button>
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
          </Space>
        </div>
        
        {selectedDomains.length > 0 && (
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={handleRequestSelected}
            block
            style={{ marginTop: 4 }}
          >
            Request Selected Domains ({selectedDomains.length})
          </Button>
        )}
      </div>

      {/* Domain Cards */}
      <div style={{ paddingBottom: 80 }}>
        {domains.map(domain => (
          <DomainCard
            key={domain.id}
            domain={domain}
            selected={selectedDomains.includes(domain.id)}
            onSelect={handleDomainSelect}
            ticketStatus={ticketStatuses[domain.domainName]}
            onRequestBuy={onRequestBuy}
          />
        ))}
      </div>

      {/* Floating Action Buttons */}
      {showScrollTop && (
        <FloatButton
          icon={<UpOutlined />}
          onClick={scrollToTop}
          style={{ right: 16, bottom: 80 }}
        />
      )}
    </div>
  );
};

export default DomainList;
