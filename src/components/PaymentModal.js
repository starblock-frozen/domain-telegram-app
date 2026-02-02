import React, { useState } from 'react';
import { Modal, Typography, Button, Divider } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
import { message } from 'antd';

const { Text } = Typography;

const PaymentModal = ({ visible, onCancel }) => {
  const [copiedStates, setCopiedStates] = useState({});

  const walletAddresses = {
    BTC: 'bc1qfyapmuph3a43qpysdncre5uvpsjn9s6n0xj0yh',
    'TRC20 USDT': 'TFi6Wvd74wPPtcgWnhFRVP7vtatnKCjmm4'
  };

  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      message.success('Copied to clipboard!');
      
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      message.error('Failed to copy to clipboard');
    }
  };

  return (
    <Modal
      title="Payment Information"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" type="primary" onClick={onCancel}>
          Close
        </Button>
      ]}
      width="90%"
      style={{ maxWidth: '400px' }}
    >
      <div>
        <Text strong>Wallet Addresses:</Text>
        <div style={{ marginTop: 12 }}>
          {Object.entries(walletAddresses).map(([currency, address]) => {
            const isCopied = copiedStates[currency];
            return (
              <div key={currency} style={{ marginBottom: 12 }}>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>
                  {currency}:
                </Text>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  backgroundColor: '#1f1f1f', 
                  padding: '8px', 
                  borderRadius: '4px' 
                }}>
                  <Text 
                    style={{ 
                      flex: 1, 
                      fontSize: '12px', 
                      wordBreak: 'break-all',
                      marginRight: 8
                    }}
                  >
                    {address}
                  </Text>
                  <Button
                    type="text"
                    size="small"
                    icon={isCopied ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined />}
                    onClick={() => copyToClipboard(address, currency)}
                    style={{ 
                      color: isCopied ? '#52c41a' : undefined,
                      flexShrink: 0
                    }}
                  />
                </div>
              </div>
            );
          })}
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
          color: '#1890ff', 
          fontSize: '16px',
          display: 'block',
          marginBottom: '12px'
        }}>
          Payment Instructions:
        </Text>
        
        <div style={{ lineHeight: '1.6', fontSize: '14px' }}>
          <Text style={{ display: 'block', marginBottom: '8px' }}>
            1. Send payment to the appropriate wallet address above
          </Text>
          <Text style={{ display: 'block', marginBottom: '8px' }}>
            2. Take a screenshot of the transaction or copy the transaction link
          </Text>
          <Text style={{ display: 'block', marginBottom: '12px' }}>
            3. Send the proof along with your domain list to our Telegram:
          </Text>
          
          <div style={{ 
            textAlign: 'center',
            padding: '12px',
            backgroundColor: '#002140',
            borderRadius: '6px',
            border: '2px solid #1890ff'
          }}>
            <a 
              href="https://t.me/bitterSweet4me" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#1890ff',
                fontSize: '18px',
                fontWeight: 'bold',
                textDecoration: 'none',
                display: 'block'
              }}
            >
              @bitterSweet4me
            </a>
            <Text style={{ 
              fontSize: '12px', 
              color: 'rgba(255, 255, 255, 0.65)',
              marginTop: '4px',
              display: 'block'
            }}>
              Click to open Telegram
            </Text>
          </div>
          
          <Text style={{ 
            display: 'block', 
            marginTop: '12px',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.65)',
            textAlign: 'center'
          }}>
            For any questions or support, contact our Telegram above
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;
