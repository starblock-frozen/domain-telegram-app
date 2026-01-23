import React, { useState } from 'react';
import { Modal, Typography, Input, Button, message } from 'antd';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

const CommentModal = ({ visible, onCancel, onSubmit, username, loading }) => {
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (!comment.trim()) {
      message.warning('Please enter your message');
      return;
    }
    onSubmit(comment);
    setComment('');
  };

  const handleCancel = () => {
    setComment('');
    onCancel();
  };

  return (
    <Modal
      title="💬 Contact Us"
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleSubmit}
          loading={loading}
        >
          Send Message
        </Button>
      ]}
      width="90%"
      style={{ maxWidth: '500px' }}
    >
      <div style={{ 
        backgroundColor: '#1f1f1f', 
        padding: '16px', 
        borderRadius: '8px',
        border: '1px solid #434343',
        marginBottom: '20px'
      }}>
        <Text strong style={{ 
          color: '#8b5cf6', 
          fontSize: '16px',
          display: 'block',
          marginBottom: '12px'
        }}>
          🤝 Partnership Opportunities
        </Text>
        
        <Paragraph style={{ 
          color: 'rgba(255, 255, 255, 0.85)',
          marginBottom: '12px',
          lineHeight: '1.6'
        }}>
          We are selling domain access right now. But we are open to any kind of long-term cooperation.
        </Paragraph>

        <Paragraph style={{ 
          color: 'rgba(255, 255, 255, 0.85)',
          marginBottom: '12px',
          lineHeight: '1.6'
        }}>
          <strong style={{ color: '#8b5cf6' }}>Our Services:</strong>
          <br />
          ✅ Domain Access Sales
          <br />
          ✅ Cloaking Services
          <br />
          ✅ DNS Management
          <br />
          ✅ Custom Solutions
        </Paragraph>

        <Paragraph style={{ 
          color: 'rgba(255, 255, 255, 0.85)',
          marginBottom: 0,
          lineHeight: '1.6'
        }}>
          We can help you achieve your goals in this blackhat world. We are open to any kind of contract, so please send a message to us!
        </Paragraph>
      </div>

      <div>
        <Text strong style={{ 
          display: 'block', 
          marginBottom: '8px',
          color: 'rgba(255, 255, 255, 0.85)'
        }}>
          Your Message:
        </Text>
        <TextArea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Type your message here..."
          rows={6}
          maxLength={1000}
          showCount
          style={{
            backgroundColor: '#0f0f0f',
            border: '2px solid #2a2a2a',
            borderRadius: '8px',
            color: '#e5e5e5',
            resize: 'none'
          }}
        />
        
        {username && (
          <Text style={{ 
            display: 'block', 
            marginTop: '8px',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.45)'
          }}>
            Sending as: <strong style={{ color: '#8b5cf6' }}>@{username}</strong>
          </Text>
        )}
      </div>
    </Modal>
  );
};

export default CommentModal;
