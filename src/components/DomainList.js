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
import PaginationBar from './PaginationBar';
import {
  exportDomainsToCSV,
  exportDomainsToDetailedCSV,
  exportSelectedDomainsToCSV,
  exportDomainStatistics
} from '../utils/csvExport';

const { Text } = Typography;

const DomainList = ({
  domains,
  allDomains = [],
  selectedDomains,
  onSelectionChange,
  ticketStatuses,
  onRequestBuy,
  onDomainCardClick,
  currentPage = 1,
  pageSize = 25,
  totalDomains = 0,
  onPageChange,
  onPageSizeChange
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const domainsForOperations = allDomains.length > 0 ? allDomains : domains;

  const handleSelectAll = (checked) => {
    if (checked) {
      const availableDomainIds = domainsForOperations
        .filter(domain => domain.status)
        .map(domain => domain.id);
      onSelectionChange(availableDomainIds);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectCurrentPage = (checked) => {
    if (checked) {
      const currentPageIds = domains
        .filter(domain => domain.status)
        .map(domain => domain.id);
      const newSelection = [...new Set([...selectedDomains, ...currentPageIds])];
      onSelectionChange(newSelection);
    } else {
      const currentPageIds = domains.map(domain => domain.id);
      const newSelection = selectedDomains.filter(id => !currentPageIds.includes(id));
      onSelectionChange(newSelection);
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
    try {
      exportDomainsToCSV(domainsForOperations, 'domains.csv');
      message.success('Domains exported successfully!');
    } catch (error) {
      message.error('Failed to export domains: ' + error.message);
    }
  };

  const handleCopySelected = async () => {
    const selectedDomainNames = domainsForOperations
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
    const selectedDomainObjects = domainsForOperations.filter(domain =>
      selectedDomains.includes(domain.id)
    );

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

  const availableDomainsCount = domainsForOperations.filter(domain => domain.status).length;
  const allAvailableSelected = availableDomainsCount > 0 &&
    selectedDomains.length === availableDomainsCount &&
    selectedDomains.every(id => {
      const domain = domainsForOperations.find(d => d.id === id);
      return domain && domain.status;
    });

  const currentPageAvailableIds = domains
    .filter(domain => domain.status)
    .map(domain => domain.id);
  const allCurrentPageSelected = currentPageAvailableIds.length > 0 &&
    currentPageAvailableIds.every(id => selectedDomains.includes(id));

  if (totalDomains === 0 && domains.length === 0) {
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
      <div className="domain-action-bar">
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: 6,
          marginBottom: 8 
        }}>
          <Button
            size="small"
            type={allCurrentPageSelected ? 'default' : 'primary'}
            onClick={() => handleSelectCurrentPage(!allCurrentPageSelected)}
            className="action-btn"
          >
            {allCurrentPageSelected ? 'Unselect Page' : 'Select Page'}
          </Button>
          <Button
            size="small"
            type={allAvailableSelected ? 'default' : 'dashed'}
            onClick={() => handleSelectAll(!allAvailableSelected)}
            className="action-btn"
          >
            {allAvailableSelected ? 'Unselect All' : `All (${availableDomainsCount})`}
          </Button>
          <Button
            size="small"
            icon={<CopyOutlined />}
            onClick={handleCopySelected}
            disabled={selectedDomains.length === 0}
            className="action-btn"
          >
            Copy ({selectedDomains.length})
          </Button>
          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={handleExportCSV}
            className="action-btn"
          >
            CSV
          </Button>
        </div>

        {selectedDomains.length > 0 && (
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={handleRequestSelected}
            block
            size="middle"
            className="request-btn"
          >
            Request Selected ({selectedDomains.length})
          </Button>
        )}
      </div>

      {/* Top Pagination Bar */}
      <PaginationBar
        currentPage={currentPage}
        pageSize={pageSize}
        total={totalDomains}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        position="top"
      />

      {/* Domain Cards */}
      <div style={{ paddingBottom: 8 }}>
        {domains.map(domain => (
          <DomainCard
            key={domain.id}
            domain={domain}
            selected={selectedDomains.includes(domain.id)}
            onSelect={handleDomainSelect}
            ticketStatus={ticketStatuses[domain.domainName]}
            onRequestBuy={onRequestBuy}
            onCardClick={onDomainCardClick}
          />
        ))}
      </div>

      {/* Bottom Pagination Bar */}
      <div style={{ paddingBottom: 80 }}>
        <PaginationBar
          currentPage={currentPage}
          pageSize={pageSize}
          total={totalDomains}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          position="bottom"
        />
      </div>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <FloatButton
          icon={<UpOutlined />}
          onClick={scrollToTop}
          style={{ right: 16, bottom: 24 }}
        />
      )}
    </div>
  );
};

export default DomainList;
