import React from 'react';
import { Pagination, Select, Typography, Space } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

const PaginationBar = ({
  currentPage,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  position = 'top' // 'top' or 'bottom'
}) => {
  const totalPages = Math.ceil(total / pageSize);
  const startItem = total === 0 ? 0 : ((currentPage - 1) * pageSize) + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1, pageSize);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1, pageSize);
    }
  };

  return (
    <div style={{
      padding: '10px 16px',
      backgroundColor: position === 'top' ? '#1a1a1a' : '#141414',
      borderBottom: position === 'top' ? '1px solid #303030' : 'none',
      borderTop: position === 'bottom' ? '1px solid #303030' : 'none',
    }}>
      {/* Mobile Layout */}
      <div className="pagination-mobile" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }}>
        {/* Row 1: Page Size & Info */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.65)' }}>
              Show:
            </Text>
            <Select
              value={pageSize}
              onChange={(value) => onPageSizeChange(value)}
              size="small"
              style={{ width: 70 }}
              dropdownStyle={{ minWidth: 80 }}
            >
              <Option value={10}>10</Option>
              <Option value={25}>25</Option>
              <Option value={50}>50</Option>
              <Option value={100}>100</Option>
            </Select>
          </div>
          
          <Text style={{ 
            fontSize: '12px', 
            color: 'rgba(255, 255, 255, 0.45)',
            textAlign: 'right'
          }}>
            {startItem}-{endItem} of {total}
          </Text>
        </div>

        {/* Row 2: Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8
        }}>
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            disabled={currentPage <= 1}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              border: '1px solid #434343',
              borderRadius: 6,
              backgroundColor: currentPage <= 1 ? '#1f1f1f' : '#262626',
              color: currentPage <= 1 ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.85)',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <LeftOutlined style={{ fontSize: 14 }} />
          </button>

          {/* Page Numbers */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            overflowX: 'auto',
            maxWidth: 'calc(100vw - 160px)',
            padding: '4px 0'
          }}>
            {generatePageNumbers(currentPage, totalPages).map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span style={{
                    padding: '0 4px',
                    color: 'rgba(255, 255, 255, 0.45)',
                    fontSize: 12
                  }}>
                    ...
                  </span>
                ) : (
                  <button
                    onClick={() => onPageChange(page, pageSize)}
                    style={{
                      minWidth: 36,
                      height: 36,
                      border: page === currentPage ? '1px solid #1890ff' : '1px solid #434343',
                      borderRadius: 6,
                      backgroundColor: page === currentPage ? '#1890ff' : '#262626',
                      color: page === currentPage ? '#fff' : 'rgba(255, 255, 255, 0.85)',
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: page === currentPage ? 600 : 400,
                      transition: 'all 0.2s',
                      flexShrink: 0
                    }}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              border: '1px solid #434343',
              borderRadius: 6,
              backgroundColor: currentPage >= totalPages ? '#1f1f1f' : '#262626',
              color: currentPage >= totalPages ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.85)',
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <RightOutlined style={{ fontSize: 14 }} />
          </button>
        </div>

        {/* Row 3: Page Info (only show on bottom) */}
        {position === 'bottom' && totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Text style={{ 
              fontSize: '11px', 
              color: 'rgba(255, 255, 255, 0.35)'
            }}>
              Page {currentPage} of {totalPages}
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to generate page numbers with ellipsis
const generatePageNumbers = (currentPage, totalPages) => {
  const pages = [];
  const maxVisible = 5; // Maximum visible page numbers on mobile
  
  if (totalPages <= maxVisible) {
    // Show all pages if total is small
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);
    
    if (currentPage > 3) {
      pages.push('...');
    }
    
    // Calculate range around current page
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);
    
    // Adjust if at the beginning
    if (currentPage <= 3) {
      start = 2;
      end = Math.min(4, totalPages - 1);
    }
    
    // Adjust if at the end
    if (currentPage >= totalPages - 2) {
      start = Math.max(2, totalPages - 3);
      end = totalPages - 1;
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (currentPage < totalPages - 2) {
      pages.push('...');
    }
    
    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
  }
  
  return pages;
};

export default PaginationBar;
