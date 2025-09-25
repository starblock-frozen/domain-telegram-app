import React from 'react';
import { Modal, Typography, Button, Divider } from 'antd';

const { Text } = Typography;

const RequestModal = ({ visible, onCancel, onConfirm, selectedDomains, loading }) => {
  const totalPrice = selectedDomains.reduce((sum, domain) => sum + (domain.displayPrice || domain.price || 0), 0);

  return (
    <Modal
      title="Confirm Purchase Request"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button 
          key="confirm" 
          type="primary" 
          onClick={onConfirm}
          loading={loading}
        >
          Yes, Send Request
        </Button>
      ]}
      width="90%"
      style={{ maxWidth: '400px' }}
    >
      <div style={{ marginBottom: 16 }}>
        <Text strong>Selected Domains ({selectedDomains.length}):</Text>
        <div style={{ marginTop: 8 }}>
          {selectedDomains.map((domain, index) => (
            <div key={index} style={{ 
              padding: '4px 8px', 
              backgroundColor: '#1f1f1f', 
              borderRadius: '4px', 
              marginBottom: 4 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text>{domain.domainName}</Text>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.65)' }}>
                    {domain.type || 'Shell'} • {domain.country} • {domain.category}
                  </div>
                </div>
                <Text strong style={{ color: '#52c41a' }}>
                  ${domain.displayPrice || domain.price}
                </Text>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, padding: '8px', backgroundColor: '#002140', borderRadius: '4px' }}>
          <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
            Total: ${totalPrice.toLocaleString()}
          </Text>
        </div>
      </div>

      <Divider />

      <div style={{ 
        backgroundColor: '#1f1f1f', 
        padding: '16px', 
        borderRadius: '8px',
        border: '1px solid #434343'
      }}>
        <Text strong style={{ 
          color: '#faad14', 
          fontSize: '16px',
          display: 'block',
          marginBottom: '12px'
        }}>
          Important Notice:
        </Text>
        
        <div style={{ lineHeight: '1.6', fontSize: '14px' }}>
          <Text style={{ display: 'block', marginBottom: '8px' }}>
            • Your request will be sent to our team for processing
          </Text>
          <Text style={{ display: 'block', marginBottom: '8px' }}>
            • Domain availability will be verified before confirmation
          </Text>
          <Text style={{ display: 'block', marginBottom: '8px' }}>
            • Payment instructions will be provided after request approval
          </Text>
          <Text style={{ display: 'block', marginBottom: '8px' }}>
            • You can check payment information anytime using the wallet button
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default RequestModal;
