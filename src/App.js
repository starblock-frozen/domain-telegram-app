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
  Modal
} from 'antd';
import { 
  ReloadOutlined, 
  SearchOutlined,
  WalletOutlined,
  ExclamationCircleOutlined
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

  const [filters, setFilters] = useState({
    domainName: '',
    countries: [],
    categories: [],
    statusFilter: 'all',
    daRange: [0, 100],
    paRange: [0, 100],
    ssRange: [0, 100],
  });

  // Fetch domains on component mount
  useEffect(() => {
    fetchDomains();
  }, []);

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

  const fetchDomains = async () => {
    try {
      setLoading(true);
      const response = await domainAPI.getPublicDomains();
      setDomains(response.data.data || []);
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

  const applyFilters = () => {
    let filtered = [...domains];

    // Domain name filter
    if (filters.domainName) {
      filtered = filtered.filter(domain =>
        domain.domainName.toLowerCase().includes(filters.domainName.toLowerCase())
      );
    }

    // Countries filter
    if (filters.countries && filters.countries.length > 0) {
      filtered = filtered.filter(domain => filters.countries.includes(domain.country));
    }

    // Categories filter
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(domain => filters.categories.includes(domain.category));
    }

    // Status filter
    if (filters.statusFilter === 'available') {
      filtered = filtered.filter(domain => domain.status === true);
    } else if (filters.statusFilter === 'sold') {
      filtered = filtered.filter(domain => domain.status === false);
    }

    // DA range filter
    filtered = filtered.filter(domain =>
      (domain.da || 0) >= filters.daRange[0] && (domain.da || 0) <= filters.daRange[1]
    );

    // PA range filter
    filtered = filtered.filter(domain =>
      (domain.pa || 0) >= filters.paRange[0] && (domain.pa || 0) <= filters.paRange[1]
    );

    // SS range filter
    filtered = filtered.filter(domain =>
      (domain.ss || 0) >= filters.ssRange[0] && (domain.ss || 0) <= filters.ssRange[1]
    );

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
      // Fetch latest domain data to check availability
      const response = await domainAPI.getPublicDomains();
      const latestDomains = response.data.data || [];
      
      const results = {
        available: [],
        sold: []
      };

      domainNames.forEach(domainName => {
        const domain = latestDomains.find(d => d.domainName === domainName);
        if (domain && domain.status) {
          results.available.push(domainName);
        } else {
          results.sold.push(domainName);
        }
      });

      return results;
    } catch (error) {
      console.error('Error checking domain availability:', error);
      throw error;
    }
  };

  const handleConfirmRequest = async () => {
    if (!userId || domainsToRequest.length === 0) return;

    try {
      setRequestLoading(true);
      
      const domainNames = domainsToRequest.map(domain => domain.domainName);
      
      // Check domain availability
      const availabilityCheck = await checkDomainAvailability(domainNames);
      
      if (availabilityCheck.sold.length > 0) {
        // Show warning modal for sold domains
        Modal.warning({
          title: 'Some Domains Are No Longer Available',
          content: (
            <div>
              <p>The following domains have been sold:</p>
              <ul>
                {availabilityCheck.sold.map(domainName => (
                  <li key={domainName} style={{ color: '#ff4d4f' }}>{domainName}</li>
                ))}
              </ul>
              {availabilityCheck.available.length > 0 && (
                <>
                  <p>Available domains:</p>
                  <ul>
                    {availabilityCheck.available.map(domainName => (
                      <li key={domainName} style={{ color: '#52c41a' }}>{domainName}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ),
          okText: 'OK',
          centered: true,
          onOk: () => {
            // Update local domain states
            setDomains(prevDomains => 
              prevDomains.map(domain => 
                availabilityCheck.sold.includes(domain.domainName) 
                  ? { ...domain, status: false }
                  : domain
              )
            );
            
            // Continue with available domains if any
            if (availabilityCheck.available.length > 0) {
              proceedWithRequest(domainsToRequest.filter(domain => 
                availabilityCheck.available.includes(domain.domainName)
              ));
            } else {
              setShowRequestModal(false);
              setDomainsToRequest([]);
            }
          }
        });
        return;
      }
      
      // All domains are available, proceed with request
      await proceedWithRequest(domainsToRequest);
      
    } catch (error) {
      console.error('Error creating ticket:', error);
      message.error('Failed to send purchase request');
    } finally {
      setRequestLoading(false);
    }
  };

  const proceedWithRequest = async (availableDomains) => {
    try {
      const ticketData = {
        customer_id: username || userId.toString(),
        request_domains: availableDomains.map(domain => domain.domainName),
        price: availableDomains.reduce((sum, domain) => sum + (domain.price || 0), 0),
        status: 'New'
      };

      await ticketAPI.createTicket(ticketData);
      
      message.success('Purchase request sent successfully!');
      setShowRequestModal(false);
      setDomainsToRequest([]);
      setSelectedDomains([]);
      
      fetchTicketStatuses();
      
    } catch (error) {
      throw error;
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
                Domain Store
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

        {/* Status Filter */}
        <div style={{ 
          padding: '8px 16px', 
          backgroundColor: '#141414', 
          borderBottom: '1px solid #303030'
        }}>
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

        {/* Domain List */}
        <DomainList
          domains={filteredDomains}
          selectedDomains={selectedDomains}
          onSelectionChange={handleSelectionChange}
          ticketStatuses={ticketStatuses}
          onRequestBuy={handleRequestBuy}
          onDomainCardClick={handleDomainCardClick}
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
          }}
          onConfirm={handleConfirmRequest}
          selectedDomains={domainsToRequest}
          loading={requestLoading}
        />
      </div>
    </ConfigProvider>
  );
}

export default App;
