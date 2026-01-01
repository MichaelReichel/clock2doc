
import { TimeEntry } from '../types';

/**
 * A robust CSV parser using a state-machine to handle quoted strings,
 * escaped quotes (""), and varying line endings (\n, \r\n).
 */
const parseCSV = (csvText: string): string[][] => {
  const result: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        // Handle escaped quotes: ""
        cell += '"';
        i++; 
      } else if (char === '"') {
        // Closing quote
        inQuotes = false;
      } else {
        cell += char;
      }
    } else {
      if (char === '"') {
        // Opening quote
        inQuotes = true;
      } else if (char === ',') {
        // End of cell
        row.push(cell);
        cell = "";
      } else if (char === '\n' || char === '\r') {
        // End of row
        row.push(cell);
        // Only add non-empty rows
        if (row.some(c => c.trim() !== "")) {
          result.push(row);
        }
        row = [];
        cell = "";
        // Skip LF in CRLF
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
      } else {
        cell += char;
      }
    }
  }

  // Handle final residue
  if (row.length > 0 || cell) {
    row.push(cell);
    if (row.some(c => c.trim() !== "")) {
      result.push(row);
    }
  }

  return result;
};

export const parseClockifyCSV = (csvText: string): TimeEntry[] => {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.trim());
  const entries: TimeEntry[] = [];

  for (let i = 1; i < rows.length; i++) {
    const values = rows[i];
    const rowData: any = {};
    
    headers.forEach((header, index) => {
      rowData[header] = (values[index] || '').trim();
    });

    // We need at least a Project or Description to consider it a valid entry
    if (!rowData['Project'] && !rowData['Description']) continue;

    entries.push({
      project: rowData['Project'] || 'No Project',
      client: rowData['Client'] || 'No Client',
      description: rowData['Description'] || 'No Description',
      task: rowData['Task'] || '',
      user: rowData['User'] || '',
      email: rowData['Email'] || '',
      tags: rowData['Tags'] || '',
      billable: rowData['Billable'] === 'Yes',
      startDate: rowData['Start Date'] || '',
      startTime: rowData['Start Time'] || '',
      endDate: rowData['End Date'] || '',
      endTime: rowData['End Time'] || '',
      duration: rowData['Duration (h)'] || '',
      durationDecimal: parseFloat(rowData['Duration (decimal)'] || '0'),
      billableRate: parseFloat(rowData['Billable Rate'] || '0'),
      billableAmount: parseFloat(rowData['Billable Amount'] || '0'),
      currency: rowData['Currency'] || 'USD'
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
