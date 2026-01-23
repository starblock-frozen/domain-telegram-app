import React, { useState, useEffect } from 'react';
import { 
  ConfigProvider, 
  theme, 
  message, 
  Button,
  Typography,
  Space,
  Radio,
  Input,
  Modal,
  Badge,
  Tooltip,
  App as AntApp  // ADD THIS IMPORT
} from 'antd';
import { 
  ReloadOutlined, 
  SearchOutlined,
  WalletOutlined,
  ExclamationCircleOutlined,
  DownOutlined,
  UpOutlined,
  MessageOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import FilterPanel from './components/FilterPanel';
import DomainList from './components/DomainList';
import RequestModal from './components/RequestModal';
import PaymentModal from './components/PaymentModal';
import CommentModal from './components/CommentModal';
import LoadingSpinner from './components/LoadingSpinner';
import useTelegram from './hooks/useTelegram';
import { domainAPI, ticketAPI, commentAPI } from './services/api';

// Import profile picture
import profilePicture from './mark.png';

import './App.css';

const { Title, Text } = Typography;

function AppContent() {
  const { message: messageApi } = AntApp.useApp(); // USE HOOK TO GET MESSAGE API
  const { user, username, userId } = useTelegram();
  const [domains, setDomains] = useState([]);
  const [filteredDomains, setFilteredDomains] = useState([]);
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [ticketStatuses, setTicketStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [domainsToRequest, setDomainsToRequest] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [warningModalData, setWarningModalData] = useState({ 
    soldDomains: [], 
    availableDomains: [], 
    callback: null 
  });

  const [filters, setFilters] = useState({
    domainName: '',
    countries: [],
    categories: [],
    domainTypes: [],
    statusFilter: 'all',
    daRange: [0, 100],
    paRange: [0, 100],
    ssRange: [0, 100],
    priceRange: [0, 1000],
    sortBy: 'newest'
  });

  useEffect(() => {
    fetchDomains();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [domains, filters]);

  useEffect(() => {
    if (userId && domains.length > 0) {
      fetchTicketStatuses();
    }
  }, [userId, domains]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    filters.domainName,
    filters.countries,
    filters.categories,
    filters.domainTypes,
    filters.statusFilter,
    filters.daRange,
    filters.paRange,
    filters.ssRange,
    filters.priceRange,
    pageSize
  ]);

  const fetchDomains = async () => {
    try {
      setLoading(true);
      setCurrentPage(1);
      const response = await domainAPI.getPublicDomains();
      
      const domainsData = response.data.data || [];
      
      const transformedDomains = domainsData.map(domain => ({
        ...domain,
        displayPrice: domain.price === 1 ? 10 : domain.price
      }));
      
      setDomains(transformedDomains);
    } catch (error) {
      console.error('Error fetching domains:', error);
      messageApi.error('Failed to fetch domains');
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketStatuses = async () => {
    if (!userId || domains.length === 0) return;

    try {
      const domainNames = domains.map(domain => domain.domainName);
      const response = await ticketAPI.getTicketsByCustomerAndDomains({
        customer_id: username || userId.toString(),
        domains: domainNames
      });

      const statuses = {};
      response.data.data.forEach(ticket => {
        ticket.matchingDomains.forEach(domainName => {
          if (!statuses[domainName] || 
              dayjs(ticket.request_time).isAfter(dayjs(statuses[domainName].request_time))) {
            statuses[domainName] = ticket.status;
          }
        });
      });

      setTicketStatuses(statuses);
    } catch (error) {
      console.error('Error fetching ticket statuses:', error);
    }
  };

  const sortDomains = (domainsToSort, sortBy) => {
    const sorted = [...domainsToSort];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => {
          const dateA = a.postDateTime || a.createdAt || '0';
          const dateB = b.postDateTime || b.createdAt || '0';
          return new Date(dateB) - new Date(dateA);
        });
      case 'oldest':
        return sorted.sort((a, b) => {
          const dateA = a.postDateTime || a.createdAt || '0';
          const dateB = b.postDateTime || b.createdAt || '0';
          return new Date(dateA) - new Date(dateB);
        });
      case 'da_high':
        return sorted.sort((a, b) => (b.da || 0) - (a.da || 0));
      case 'da_low':
        return sorted.sort((a, b) => (a.da || 0) - (b.da || 0));
      case 'price_high':
        return sorted.sort((a, b) => (b.displayPrice || 0) - (a.displayPrice || 0));
      case 'price_low':
        return sorted.sort((a, b) => (a.displayPrice || 0) - (b.displayPrice || 0));
      default:
        return sorted;
    }
  };

  const applyFilters = () => {
    let filtered = [...domains];

    if (filters.domainName) {
      filtered = filtered.filter(domain =>
        domain.domainName.toLowerCase().includes(filters.domainName.toLowerCase())
      );
    }

    if (filters.countries && filters.countries.length > 0) {
      filtered = filtered.filter(domain => filters.countries.includes(domain.country));
    }

    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(domain => filters.categories.includes(domain.category));
    }

    if (filters.domainTypes && filters.domainTypes.length > 0) {
      filtered = filtered.filter(domain => {
        const domainType = domain.type || 'Shell';
        return filters.domainTypes.includes(domainType);
      });
    }

    if (filters.statusFilter === 'available') {
      filtered = filtered.filter(domain => domain.status === true);
    } else if (filters.statusFilter === 'sold') {
      filtered = filtered.filter(domain => domain.status === false);
    }

    filtered = filtered.filter(domain =>
      (domain.da || 0) >= filters.daRange[0] && (domain.da || 0) <= filters.daRange[1]
    );

    filtered = filtered.filter(domain =>
      (domain.pa || 0) >= filters.paRange[0] && (domain.pa || 0) <= filters.paRange[1]
    );

    filtered = filtered.filter(domain =>
      (domain.ss || 0) >= filters.ssRange[0] && (domain.ss || 0) <= filters.ssRange[1]
    );

    filtered = filtered.filter(domain =>
      (domain.displayPrice || 0) >= filters.priceRange[0] && 
      (domain.displayPrice || 0) <= filters.priceRange[1]
    );

    filtered = sortDomains(filtered, filters.sortBy);

    setFilteredDomains(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      domainName: filters.domainName,
      countries: [],
      categories: [],
      domainTypes: [],
      statusFilter: 'all',
      daRange: [0, 100],
      paRange: [0, 100],
      ssRange: [0, 100],
      priceRange: [0, 1000],
      sortBy: 'newest'
    });
  };

  const handleStatusFilterChange = (e) => {
    setFilters(prev => ({
      ...prev,
      statusFilter: e.target.value
    }));
  };

  const handleDomainNameChange = (e) => {
    setFilters(prev => ({
      ...prev,
      domainName: e.target.value
    }));
  };

  const handlePageChange = (page, newPageSize) => {
    setCurrentPage(page);
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const getPaginatedDomains = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredDomains.slice(startIndex, endIndex);
  };

  const handleRequestBuy = (domainsToRequest) => {
    if (!userId) {
      messageApi.error('Telegram user information not available');
      return;
    }
    setDomainsToRequest(domainsToRequest);
    setShowRequestModal(true);
  };

  const handleRequestSelected = () => {
    const selectedDomainObjects = filteredDomains.filter(domain =>
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
      handleRequestBuy(availableSelectedDomains);
    } else {
      messageApi.warning('No available domains selected');
    }
  };

  const checkDomainAvailability = async (domainNames) => {
    try {
      const response = await domainAPI.getPublicDomains();
      const latestDomains = response.data?.data || response.data || [];
      
      const results = {
        available: [],
        sold: []
      };

      domainNames.forEach(domainName => {
        const domain = latestDomains.find(d => d.domainName === domainName);
        
        if (domain) {
          if (domain.status === true) {
            results.available.push(domainName);
          } else {
            results.sold.push(domainName);
          }
        } else {
          results.sold.push(domainName);
        }
      });

      return results;
    } catch (error) {
      console.error('Error checking domain availability:', error);
      return {
        available: domainNames,
        sold: []
      };
    }
  };

  const updateDomainStatus = (domainNames, status) => {
    setDomains(prevDomains => 
      prevDomains.map(domain => 
        domainNames.includes(domain.domainName) 
          ? { ...domain, status: status }
          : domain
      )
    );

    if (!status) {
      const soldDomainIds = domains
        .filter(domain => domainNames.includes(domain.domainName))
        .map(domain => domain.id);
      
      setSelectedDomains(prevSelected => 
        prevSelected.filter(id => !soldDomainIds.includes(id))
      );
    }
  };

  const showSoldDomainsWarning = (soldDomains, availableDomains, callback) => {
    setWarningModalData({ soldDomains, availableDomains, callback });
    setWarningModalVisible(true);
  };

  const handleWarningModalOk = () => {
    updateDomainStatus(warningModalData.soldDomains, false);
    
    if (warningModalData.callback) {
      warningModalData.callback();
    }
    
    setWarningModalVisible(false);
    setWarningModalData({ soldDomains: [], availableDomains: [], callback: null });
  };

  const handleWarningModalCancel = () => {
    setWarningModalVisible(false);
    setWarningModalData({ soldDomains: [], availableDomains: [], callback: null });
    setRequestLoading(false);
  };

  const handleConfirmRequest = async () => {
    if (!userId || domainsToRequest.length === 0) return;

    try {
      setRequestLoading(true);
      
      const domainNames = domainsToRequest.map(domain => domain.domainName);
      const availabilityCheck = await checkDomainAvailability(domainNames);
      
      if (availabilityCheck.sold.length > 0) {
        showSoldDomainsWarning(
          availabilityCheck.sold, 
          availabilityCheck.available,
          () => {
            if (availabilityCheck.available.length > 0) {
              const availableDomainsToRequest = domainsToRequest.filter(domain => 
                availabilityCheck.available.includes(domain.domainName)
              );
              proceedWithRequest(availableDomainsToRequest);
            } else {
              setShowRequestModal(false);
              setDomainsToRequest([]);
            }
          }
        );
        
        setRequestLoading(false);
        return;
      }
      
      await proceedWithRequest(domainsToRequest);
      
    } catch (error) {
      console.error('Error in handleConfirmRequest:', error);
      messageApi.error('Failed to send purchase request: ' + error.message);
      setRequestLoading(false);
    }
  };

  const proceedWithRequest = async (availableDomains) => {
    try {
      const ticketData = {
        customer_id: username || userId.toString(),
        request_domains: availableDomains.map(domain => domain.domainName),
        price: availableDomains.reduce((sum, domain) => sum + (domain.displayPrice || 0), 0),
        status: 'New'
      };

      await ticketAPI.createTicket(ticketData);
      
      messageApi.success('Purchase request sent successfully!');
      setShowRequestModal(false);
      setDomainsToRequest([]);
      setSelectedDomains([]);
      
      fetchTicketStatuses();
      
    } catch (error) {
      console.error('Error in proceedWithRequest:', error);
      throw error;
    } finally {
      setRequestLoading(false);
    }
  };

  const handleCommentSubmit = async (comment) => {
    if (!userId) {
      messageApi.error('Telegram user information not available');
      return;
    }

    try {
      setCommentLoading(true);
      
      await commentAPI.createComment({
        telegram_username: username || userId.toString(),
        content: comment
      });
      
      // Success notification at bottom center
      messageApi.success({
        content: '✅ Message sent successfully! We will contact you soon.',
        duration: 4,
      });
      
      setShowCommentModal(false);
    } catch (error) {
      console.error('Error sending comment:', error);
      
      // Error notification at bottom center
      messageApi.error({
        content: '❌ Failed to send message. Please try again.',
        duration: 4,
      });
    } finally {
      setCommentLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDomains();
    if (userId) {
      fetchTicketStatuses();
    }
  };

  const handleSelectionChange = (newSelectedDomains) => {
    const availableSelections = newSelectedDomains.filter(domainId => {
      const domain = domains.find(d => d.id === domainId);
      return domain && domain.status;
    });
    setSelectedDomains(availableSelections);
  };

  const handleDomainCardClick = (domainId) => {
    const domain = domains.find(d => d.id === domainId);
    if (!domain || !domain.status) return;

    if (selectedDomains.includes(domainId)) {
      setSelectedDomains(selectedDomains.filter(id => id !== domainId));
    } else {
      setSelectedDomains([...selectedDomains, domainId]);
    }
  };

  if (loading) {
    return <LoadingSpinner tip="Loading domains..." />;
  }

  return (
    <div className="App">
      {/* Fixed Header with Filter Button */}
      <div className="fixed-header">
        {/* Top Bar */}
        <div className="header-top-bar">
          <div className="header-content">
            <div className="header-left">
              <div className="logo-container">
                <img 
                  src={profilePicture} 
                  alt="Profile" 
                  className="profile-picture"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%238b5cf6"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="white" font-size="40" font-weight="bold">P</text></svg>';
                  }}
                />
                <div className="logo-text">
                  <Title level={4} className="app-title">
                    PHILLIP STORE
                  </Title>
                  {user && (
                    <Text className="welcome-text">
                      Welcome, {user.first_name || username || 'User'}
                    </Text>
                  )}
                </div>
              </div>
            </div>
            <Space className="header-actions" size="small">
              <Button
                type="text"
                className="filter-toggle-btn-header"
                onClick={() => setShowFilters(!showFilters)}
                icon={showFilters ? <UpOutlined /> : <DownOutlined />}
              >
                {showFilters ? 'Close' : 'Filter'}
              </Button>
              <Button
                type="text"
                icon={<WalletOutlined />}
                onClick={() => setShowPaymentModal(true)}
                className="header-icon-btn"
                title="Payment Info"
              />
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                className="header-icon-btn"
                title="Refresh"
              />
            </Space>
          </div>
          
          {/* Domain Search */}
          <div className="search-container">
            <Input
              placeholder="Search domain name..."
              value={filters.domainName}
              onChange={handleDomainNameChange}
              prefix={<SearchOutlined className="search-icon" />}
              allowClear
              className="search-input"
              size="large"
            />
          </div>
          
          <div className="domains-count">
            <Text className="count-text">
              <span className="count-number">{filteredDomains.length}</span> domains found
            </Text>
          </div>
        </div>
      </div>

      {/* Filter Panel Overlay */}
      <FilterPanel
        visible={showFilters}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        domains={domains}
        onClose={() => setShowFilters(false)}
      />

      {/* Scrollable Content */}
      <div className="scrollable-content">
        {/* Status Filter */}
        <div className="status-filter-section">
          <Radio.Group
            value={filters.statusFilter}
            onChange={handleStatusFilterChange}
            buttonStyle="solid"
            size="large"
            style={{ width: '100%', marginTop: 14, textAlign: "center" }}
            className="status-radio-group"
          >
            <Radio.Button value="all">
              All ({domains.length})
            </Radio.Button>
            <Radio.Button value="available">
              Active ({domains.filter(d => d.status).length})
            </Radio.Button>
            <Radio.Button value="sold">
              Sold ({domains.filter(d => !d.status).length})
            </Radio.Button>
          </Radio.Group>
        </div>

        {/* Domain List with Pagination */}
        <DomainList
          domains={getPaginatedDomains()}
          allDomains={filteredDomains}
          selectedDomains={selectedDomains}
          onSelectionChange={handleSelectionChange}
          ticketStatuses={ticketStatuses}
          onRequestBuy={handleRequestBuy}
          onDomainCardClick={handleDomainCardClick}
          currentPage={currentPage}
          pageSize={pageSize}
          totalDomains={filteredDomains.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          sortBy={filters.sortBy}
          onSortChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
        />
      </div>

      {/* Fixed Action Buttons */}
      <div className="fixed-action-buttons">
        {/* Request Selected Button - Shows on top when domains are selected */}
        {selectedDomains.length > 0 && (
          <Tooltip title={`Request ${selectedDomains.length} selected domains`} placement="left">
            <div style={{ position: 'relative' }}>
              <Button
                type="primary"
                shape="circle"
                icon={<ShoppingCartOutlined />}
                onClick={handleRequestSelected}
                className="fixed-action-btn request-all-btn"
              />
              <div className="request-badge">
                {selectedDomains.length}
              </div>
            </div>
          </Tooltip>
        )}
        
        {/* Comment Button - Always visible at bottom with light green color */}
        <Tooltip title="Contact Us / Partnership" placement="left">
          <Button
            type="primary"
            shape="circle"
            icon={<MessageOutlined />}
            onClick={() => setShowCommentModal(true)}
            className="fixed-action-btn comment-btn"
          />
        </Tooltip>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        visible={showPaymentModal}
        onCancel={() => setShowPaymentModal(false)}
      />

      {/* Request Confirmation Modal */}
      <RequestModal
        visible={showRequestModal}
        onCancel={() => {
          setShowRequestModal(false);
          setDomainsToRequest([]);
          setRequestLoading(false);
        }}
        onConfirm={handleConfirmRequest}
        selectedDomains={domainsToRequest}
        loading={requestLoading}
      />

      {/* Comment Modal */}
      <CommentModal
        visible={showCommentModal}
        onCancel={() => setShowCommentModal(false)}
        onSubmit={handleCommentSubmit}
        username={username || userId?.toString()}
        loading={commentLoading}
      />

      {/* Warning Modal for Sold Domains */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '18px' }} />
            <span>Domain Availability Update</span>
          </div>
        }
        open={warningModalVisible}
        onOk={handleWarningModalOk}
        onCancel={handleWarningModalCancel}
        okText={warningModalData.availableDomains.length > 0 ? "Continue" : "OK"}
        cancelText="Cancel"
        centered
        width="90%"
        style={{ maxWidth: '400px' }}
        zIndex={2000}
        maskClosable={false}
        closable={true}
        destroyOnClose={true}
        className="warning-modal"
      >
        <div>
          <div style={{ marginBottom: '16px' }}>
            <Text strong style={{ color: '#ff4d4f', display: 'block', marginBottom: '8px' }}>
              The following domains are no longer available:
            </Text>
            <div style={{ 
              backgroundColor: '#2a1215', 
              border: '1px solid #ff4d4f', 
              borderRadius: '6px', 
              padding: '8px',
              marginBottom: '12px'
            }}>
              {warningModalData.soldDomains.map(domainName => (
                <div key={domainName} style={{ 
                  color: '#ff4d4f', 
                  fontSize: '13px',
                  marginBottom: '4px'
                }}>
                  • {domainName}
                </div>
              ))}
            </div>
          </div>
          
          {warningModalData.availableDomains.length > 0 && (
            <div>
              <Text strong style={{ color: '#52c41a', display: 'block', marginBottom: '8px' }}>
                Still available domains:
              </Text>
              <div style={{ 
                backgroundColor: '#162312', 
                border: '1px solid #52c41a', 
                borderRadius: '6px', 
                padding: '8px'
              }}>
                {warningModalData.availableDomains.map(domainName => (
                  <div key={domainName} style={{ 
                    color: '#52c41a', 
                    fontSize: '13px',
                    marginBottom: '4px'
                  }}>
                    • {domainName}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            backgroundColor: '#1f1f1f', 
            borderRadius: '6px',
            border: '1px solid #434343'
          }}>
            <Text style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.65)' }}>
              {warningModalData.availableDomains.length > 0 
                ? 'Would you like to continue with the available domains?' 
                : 'All selected domains have been sold. Please select other domains.'}
            </Text>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// MAIN APP WRAPPER COMPONENT
function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#8b5cf6',
          colorBgContainer: '#0f0f0f',
          colorBgElevated: '#1a1a1a',
          colorBorder: '#2a2a2a',
          colorText: '#e5e5e5',
          colorTextSecondary: '#a3a3a3',
          colorBgBase: '#000000',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
      }}
    >
      <AntApp
        message={{
          top: 'auto',
          bottom: 80,
          duration: 4,
          maxCount: 3,
        }}
      >
        <AppContent />
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
