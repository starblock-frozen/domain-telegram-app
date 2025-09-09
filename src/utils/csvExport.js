export const exportDomainsToCSV = (domains, filename = 'domains.csv') => {
  const headers = [
    'Domain Name',
    'Country',
    'Category',
    'DA',
    'PA',
    'SS',
    'Backlinks',
    'Price',
    'Status'
  ];

  const csvContent = [
    headers.join(','),
    ...domains.map(domain => [
      `"${domain.domainName || ''}"`,
      `"${domain.country || ''}"`,
      `"${domain.category || ''}"`,
      domain.da || 0,
      domain.pa || 0,
      domain.ss || 0,
      domain.backlink || 0,
      domain.price || 0,
      domain.status ? 'Available' : 'Sold'
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
