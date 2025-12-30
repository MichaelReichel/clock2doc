
import { TimeEntry } from '../types';

export const parseClockifyCSV = (csvText: string): TimeEntry[] => {
  const lines = csvText.split(/\r?\n/);
  if (lines.length < 2) return [];

  // Extract headers
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  const entries: TimeEntry[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    // Simple CSV parser that handles quotes
    const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    const row: any = {};
    
    headers.forEach((header, index) => {
      let val = (values[index] || '').trim().replace(/^"|"$/g, '');
      row[header] = val;
    });

    // Mapping based on typical Clockify Export headers
    // Note: CSV headers can vary slightly by language or export version
    entries.push({
      project: row['Project'] || '',
      client: row['Client'] || '',
      description: row['Description'] || '',
      task: row['Task'] || '',
      user: row['User'] || '',
      email: row['Email'] || '',
      tags: row['Tags'] || '',
      billable: row['Billable'] === 'Yes',
      startDate: row['Start Date'] || '',
      startTime: row['Start Time'] || '',
      endDate: row['End Date'] || '',
      endTime: row['End Time'] || '',
      duration: row['Duration (h)'] || '',
      durationDecimal: parseFloat(row['Duration (decimal)'] || '0'),
      billableRate: parseFloat(row['Billable Rate'] || '0'),
      billableAmount: parseFloat(row['Billable Amount'] || '0'),
      currency: row['Currency'] || 'USD'
    });
  }

  return entries;
};

export const aggregateEntries = (entries: TimeEntry[]): any[] => {
  const groups: Record<string, any> = {};

  entries.forEach(entry => {
    // Group by Project + Description
    const key = `${entry.project}-${entry.description}`;
    if (!groups[key]) {
      groups[key] = {
        id: Math.random().toString(36).substr(2, 9),
        description: entry.description || 'No description',
        project: entry.project || 'No project',
        quantity: 0,
        rate: entry.billableRate || 0,
        total: 0
      };
    }
    groups[key].quantity += entry.durationDecimal;
    groups[key].total += entry.billableAmount;
  });

  return Object.values(groups);
};
