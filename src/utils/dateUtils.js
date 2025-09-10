import dayjs from 'dayjs';

export const formatDate = (date) => {
  return dayjs(date).format('MMM DD, YYYY');
};

export const isToday = (date) => {
  return dayjs(date).isSame(dayjs(), 'day');
};

export const isYesterday = (date) => {
  return dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day');
};

export const filterByDate = (domains, selectedDate) => {
  if (!selectedDate) return domains;
  
  return domains.filter(domain => {
    if (!domain.postDateTime) return false;
    return dayjs(domain.postDateTime).isSame(selectedDate, 'day');
  });
};
