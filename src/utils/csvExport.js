export const exportDomainsToCSV = (domains, filename = 'domains.csv') => {
  const headers = [
    'Domain Name',
    'Country',
    'Category',
    'Type',
    'DA',
    'PA',
    'SS',
    'Backlinks',
    'Price',
    'Status',
    'Posted Date'
  ];

  const csvContent = [
    headers.join(','),
    ...domains.map(domain => [
      `"${domain.domainName || ''}"`,
      `"${domain.country || ''}"`,
      `"${domain.category || ''}"`,
      `"${domain.type || 'Shell'}"`,
      domain.da || 0,
      domain.pa || 0,
      domain.ss || 0,
      domain.backlink || 0,
      domain.displayPrice || domain.price || 0,
      domain.status ? 'Available' : 'Sold',
      `"${domain.postDateTime ? new Date(domain.postDateTime).toLocaleDateString() : domain.createdAt ? new Date(domain.createdAt).toLocaleDateString() : 'N/A'}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Enhanced export function with more detailed information
export const exportDomainsToDetailedCSV = (domains, filename = 'domains_detailed.csv') => {
  const headers = [
    'Domain Name',
    'Country',
    'Category',
    'Type',
    'DA',
    'PA',
    'SS',
    'Backlinks',
    'Price',
    'Display Price',
    'Status',
    'Is Channel Posted',
    'Posted Date',
    'Created Date',
    'Updated Date'
  ];

  const csvContent = [
    headers.join(','),
    ...domains.map(domain => {
      const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
          return new Date(dateString).toLocaleString();
        } catch (error) {
          return 'Invalid Date';
        }
      };

      return [
        `"${domain.domainName || ''}"`,
        `"${domain.country || ''}"`,
        `"${domain.category || ''}"`,
        `"${domain.type || 'Shell'}"`,
        domain.da || 0,
        domain.pa || 0,
        domain.ss || 0,
        domain.backlink || 0,
        domain.price || 0,
        domain.displayPrice || domain.price || 0,
        domain.status ? 'Available' : 'Sold',
        domain.ischannel ? 'Yes' : 'No',
        `"${formatDate(domain.postDateTime)}"`,
        `"${formatDate(domain.createdAt)}"`,
        `"${formatDate(domain.updatedAt)}"`
      ].join(',');
    })
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Export function for selected domains only
export const exportSelectedDomainsToCSV = (domains, selectedDomainIds, filename = 'selected_domains.csv') => {
  const selectedDomains = domains.filter(domain => selectedDomainIds.includes(domain.id));
  
  if (selectedDomains.length === 0) {
    throw new Error('No domains selected for export');
  }
  
  exportDomainsToCSV(selectedDomains, filename);
  return selectedDomains.length;
};

// Export function with custom fields
export const exportDomainsWithCustomFields = (domains, fields = [], filename = 'domains_custom.csv') => {
  const defaultFields = [
    { key: 'domainName', label: 'Domain Name', format: (value) => `"${value || ''}"` },
    { key: 'country', label: 'Country', format: (value) => `"${value || ''}"` },
    { key: 'category', label: 'Category', format: (value) => `"${value || ''}"` },
    { key: 'type', label: 'Type', format: (value) => `"${value || 'Shell'}"` },
    { key: 'da', label: 'DA', format: (value) => value || 0 },
    { key: 'pa', label: 'PA', format: (value) => value || 0 },
    { key: 'ss', label: 'SS', format: (value) => value || 0 },
    { key: 'backlink', label: 'Backlinks', format: (value) => value || 0 },
    { key: 'price', label: 'Price', format: (value) => value || 0 },
    { key: 'displayPrice', label: 'Display Price', format: (value, domain) => value || domain.price || 0 },
    { key: 'status', label: 'Status', format: (value) => value ? 'Available' : 'Sold' },
    { key: 'ischannel', label: 'Posted to Channel', format: (value) => value ? 'Yes' : 'No' },
    { key: 'postDateTime', label: 'Posted Date', format: (value) => value ? `"${new Date(value).toLocaleDateString()}"` : '"N/A"' },
    { key: 'createdAt', label: 'Created Date', format: (value) => value ? `"${new Date(value).toLocaleDateString()}"` : '"N/A"' }
  ];

  const fieldsToExport = fields.length > 0 ? fields : defaultFields;
  const headers = fieldsToExport.map(field => field.label);

  const csvContent = [
    headers.join(','),
    ...domains.map(domain => 
      fieldsToExport.map(field => {
        const value = domain[field.key];
        return field.format ? field.format(value, domain) : (value || '');
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Export function for analytics/statistics
export const exportDomainStatistics = (domains, filename = 'domain_statistics.csv') => {
  const stats = {
    total: domains.length,
    available: domains.filter(d => d.status).length,
    sold: domains.filter(d => !d.status).length,
    posted: domains.filter(d => d.ischannel).length,
    byCountry: {},
    byCategory: {},
    byType: {},
    priceRanges: {
      '0-10': 0,
      '11-50': 0,
      '51-100': 0,
      '101-500': 0,
      '500+': 0
    },
    daRanges: {
      '0-10': 0,
      '11-30': 0,
      '31-50': 0,
      '51-70': 0,
      '70+': 0
    }
  };

  domains.forEach(domain => {
    // Country stats
    const country = domain.country || 'Unknown';
    stats.byCountry[country] = (stats.byCountry[country] || 0) + 1;

    // Category stats
    const category = domain.category || 'Unknown';
    stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

    // Type stats
    const type = domain.type || 'Shell';
    stats.byType[type] = (stats.byType[type] || 0) + 1;

    // Price range stats
    const price = domain.displayPrice || domain.price || 0;
    if (price <= 10) stats.priceRanges['0-10']++;
    else if (price <= 50) stats.priceRanges['11-50']++;
    else if (price <= 100) stats.priceRanges['51-100']++;
    else if (price <= 500) stats.priceRanges['101-500']++;
    else stats.priceRanges['500+']++;

    // DA range stats
    const da = domain.da || 0;
    if (da <= 10) stats.daRanges['0-10']++;
    else if (da <= 30) stats.daRanges['11-30']++;
    else if (da <= 50) stats.daRanges['31-50']++;
    else if (da <= 70) stats.daRanges['51-70']++;
    else stats.daRanges['70+']++;
  });

  const csvRows = [
    'Metric,Value',
    `Total Domains,${stats.total}`,
    `Available Domains,${stats.available}`,
    `Sold Domains,${stats.sold}`,
    `Posted to Channel,${stats.posted}`,
    '',
    'Country Distribution,Count',
    ...Object.entries(stats.byCountry).map(([country, count]) => `"${country}",${count}`),
    '',
    'Category Distribution,Count',
    ...Object.entries(stats.byCategory).map(([category, count]) => `"${category}",${count}`),
    '',
    'Type Distribution,Count',
    ...Object.entries(stats.byType).map(([type, count]) => `"${type}",${count}`),
    '',
    'Price Ranges,Count',
    ...Object.entries(stats.priceRanges).map(([range, count]) => `"${range}",${count}`),
    '',
    'DA Ranges,Count',
    ...Object.entries(stats.daRanges).map(([range, count]) => `"${range}",${count}`)
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return stats;
};
