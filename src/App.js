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
  Select
} from 'antd';
import { 
  ReloadOutlined, 
  SearchOutlined,
  WalletOutlined,
  ExclamationCircleOutlined,
  SortAscendingOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import FilterPanel from './components/FilterPanel';
import DomainList from './components/DomainList';
import RequestModal from './components/RequestModal';
import PaymentModal from './components/PaymentModal';
import LoadingSpinner from './components/LoadingSpinner';
import useTelegram from './hooks/useTelegram';
import { domainAPI, ticketAPI } from './services/api';
import { isToday } from './utils/dateUtils';

import './App.css';

const { Title, Text } = Typography;
const { Option } = Select;

function App() {
  const { user, username, userId } = useTelegram();
  const [domains, setDomains] = useState([]);
  const [filteredDomains, setFilteredDomains] = useState([]);
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [ticketStatuses, setTicketStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [domainsToRequest, setDomainsToRequest] = useState([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Warning Modal State
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
    statusFilter: 'all',
    daRange: [0, 100],
    paRange: [0, 100],
    ssRange: [0, 100],
    domainType: 'good',
    sortBy: 'newest'
  });

  // Fetch domains on component mount
  useEffect(() => {
    fetchDomains();
  }, [filters.domainType]);

  // Apply filters when domains or filters change
  useEffect(() => {
    applyFilters();
  }, [domains, filters]);

  // Fetch ticket statuses when user is available and domains are loaded
  useEffect(() => {
    if (userId && domains.length > 0) {
      fetchTicketStatuses();
    }
  }, [userId, domains]);

  // Reset page when filters change (except sortBy to maintain position when sorting)
  useEffect(() => {
    setCurrentPage(1);
  }, [
    filters.domainName,
    filters.countries,
    filters.categories,
    filters.statusFilter,
    filters.daRange,
    filters.paRange,
    filters.ssRange,
    filters.domainType,
    pageSize
  ]);

  const fetchDomains = async () => {
    try {
      setLoading(true);
      setCurrentPage(1);
      let response;
      
      if (filters.domainType === 'good') {
        response = await domainAPI.getPublicDomains();
      } else {
        response = await domainAPI.getAllDomains();
      }
      
      const domainsData = response.data.data || [];
      
      const transformedDomains = domainsData.map(domain => ({
        ...domain,
        displayPrice: domain.price === 1 ? 10 : domain.price
      }));
      
      setDomains(transformedDomains);
    } catch (error) {
      console.error('Error fetching domains:', error);
      message.error('Failed to fetch domains');
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

    filtered = sortDomains(filtered, filters.sortBy);

    setFilteredDomains(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      domainName: '',
      countries: [],
      categories: [],
      statusFilter: 'all',
      daRange: [0, 100],
      paRange: [0, 100],
      ssRange: [0, 100],
      domainType: filters.domainType,
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

  const handleDomainTypeChange = (e) => {
    setFilters(prev => ({
      ...prev,
      domainType: e.target.value
    }));
  };

  const handleSortChange = (value) => {
    setFilters(prev => ({
      ...prev,
      sortBy: value
    }));
  };

  // Pagination handlers
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

  // Calculate paginated domains
  const getPaginatedDomains = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredDomains.slice(startIndex, endIndex);
  };

  const handleRequestBuy = (domainsToRequest) => {
    if (!userId) {
      message.error('Telegram user information not available');
      return;
    }
    setDomainsToRequest(domainsToRequest);
    setShowRequestModal(true);
  };

  const checkDomainAvailability = async (domainNames) => {
    try {
      let response;
      if (filters.domainType === 'good') {
        response = await domainAPI.getPublicDomains();
      } else {
        response = await domainAPI.getAllDomains();
      }
      
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
      message.error('Failed to send purchase request: ' + error.message);
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
      
      message.success('Purchase request sent successfully!');
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
    return (
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: '#1890ff',
            colorBgContainer: '#141414',
            colorBgElevated: '#1f1f1f',
            colorBorder: '#303030',
            colorText: 'rgba(255, 255, 255, 0.85)',
            colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
            colorBgBase: '#000000',
          },
        }}
      >
        <div className="App">
          <LoadingSpinner tip="Loading domains..." />
        </div>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          colorBgContainer: '#141414',
          colorBgElevated: '#1f1f1f',
          colorBorder: '#303030',
          colorText: 'rgba(255, 255, 255, 0.85)',
          colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
          colorBgBase: '#000000',
        },
      }}
    >
      <div className="App">
        {/* Header */}
        <div style={{ 
          padding: '12px 16px', 
          backgroundColor: '#001529', 
          borderBottom: '1px solid #303030',
          position: 'sticky',
          top: 0,
          zIndex: 200
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                WebShell Store
              </Title>
              {user && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Welcome, {user.first_name || username || 'User'}
                </Text>
              )}
            </div>
            <Space>
              <Button
                type="text"
                icon={<WalletOutlined />}
                onClick={() => setShowPaymentModal(true)}
                size="small"
                style={{ color: 'rgba(255, 255, 255, 0.65)' }}
                title="Payment Info"
              />
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                size="small"
                style={{ color: 'rgba(255, 255, 255, 0.65)' }}
                title="Refresh"
              />
            </Space>
          </div>
          
          {/* Domain Search */}
          <div style={{ marginTop: 12 }}>
            <Input
              placeholder="Search domain name..."
              value={filters.domainName}
              onChange={handleDomainNameChange}
              prefix={<SearchOutlined style={{ color: 'rgba(255, 255, 255, 0.45)' }} />}
              allowClear
              style={{ marginBottom: 8 }}
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.45)' }}>
              {filteredDomains.length} domains found
            </Text>
          </div>
        </div>

        {/* Domain Type Selection */}
        <div className="domain-type-selection" style={{ 
          padding: '12px 16px', 
          backgroundColor: '#141414', 
          borderBottom: '1px solid #303030',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ marginBottom: 8 }}>
            <Text strong style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)' }}>
              Domain Selection
            </Text>
          </div>
          <Radio.Group
            value={filters.domainType}
            onChange={handleDomainTypeChange}
            buttonStyle="solid"
            size="small"
            style={{ width: '100%', marginBottom: 8 }}
            className="glowing-radio-group"
          >
            <Radio.Button value="good" className="glowing-radio-button">
              Show Good Domains
            </Radio.Button>
            <Radio.Button value="all" className="glowing-radio-button">
              Show All Domains
            </Radio.Button>
          </Radio.Group>
          
          {/* Flowing Text */}
          <div className="flowing-text-container">
            <div className="flowing-text">
              💡 If you want to buy bulk domains, please click the "Show All Domains" button for complete inventory access
            </div>
          </div>
        </div>

        {/* Sort and Status Filter */}
        <div style={{ 
          padding: '8px 16px', 
          backgroundColor: '#141414', 
          borderBottom: '1px solid #303030'
        }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
              <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: 4 }}>
                Sort By
              </Text>
              <Select
                value={filters.sortBy}
                onChange={handleSortChange}
                size="small"
                style={{ width: '100%' }}
                suffixIcon={<SortAscendingOutlined />}
              >
                <Option value="newest">Newest to Oldest</Option>
                <Option value="oldest">Oldest to Newest</Option>
                <Option value="da_high">DA (High to Low)</Option>
                <Option value="da_low">DA (Low to High)</Option>
                <Option value="price_high">Price (High to Low)</Option>
                <Option value="price_low">Price (Low to High)</Option>
              </Select>
            </div>
          </div>
          
          <div style={{ marginBottom: 4 }}>
            <Text strong style={{ fontSize: '12px' }}>Domain Status</Text>
          </div>
          <Radio.Group
            value={filters.statusFilter}
            onChange={handleStatusFilterChange}
            buttonStyle="solid"
            size="small"
            style={{ width: '100%' }}
          >
            <Radio.Button value="all" style={{ flex: 1, textAlign: 'center' }}>
              All ({domains.length})
            </Radio.Button>
            <Radio.Button value="available" style={{ flex: 1, textAlign: 'center' }}>
              Available ({domains.filter(d => d.status).length})
            </Radio.Button>
            <Radio.Button value="sold" style={{ flex: 1, textAlign: 'center' }}>
              Sold ({domains.filter(d => !d.status).length})
            </Radio.Button>
          </Radio.Group>
        </div>

        {/* Filter Panel */}
        <FilterPanel
          visible={showFilters}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          domains={domains}
          onToggle={() => setShowFilters(!showFilters)}
        />

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
        />

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
    </ConfigProvider>
  );
}

export default App;
