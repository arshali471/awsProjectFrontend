// Utility functions for AWS Cost Dashboard

import { Service, ChartDataPoint, TimeSeriesDataPoint, EC2Instance, Resource, TableEC2Instance, TableResource } from '../types/cost.types';

/**
 * Format currency with proper localization
 */
export const formatCurrency = (amount: string | number, currency: string = 'USD'): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) return '$0.00';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
};

/**
 * Format large numbers with K, M, B suffixes
 */
export const formatCompactNumber = (num: number): string => {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toFixed(2);
};

/**
 * Calculate percentage change between two values
 */
export const calculatePercentageChange = (current: number, previous: number): string => {
  if (previous === 0) return 'N/A';
  const change = ((current - previous) / previous) * 100;
  return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
};

/**
 * Get color based on percentage change (green for decrease, red for increase)
 */
export const getChangeColor = (change: number): string => {
  if (change > 0) return '#ef4444'; // red (cost increase is bad)
  if (change < 0) return '#10b981'; // green (cost decrease is good)
  return '#6b7280'; // gray (no change)
};

/**
 * Format date to readable string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format date for charts (shorter format)
 */
export const formatChartDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Group services by cost, keep top N and group rest as "Other"
 */
export const groupServices = (services: Service[], topN: number = 10): Service[] => {
  if (!services || services.length === 0) return [];

  const sorted = [...services].sort((a, b) => b.totalCost - a.totalCost);
  const top = sorted.slice(0, topN);
  const others = sorted.slice(topN);

  if (others.length > 0) {
    const otherTotal = others.reduce((sum, s) => sum + s.totalCost, 0);
    const otherUsage = others.reduce((sum, s) => sum + s.totalUsage, 0);

    top.push({
      serviceName: 'Other Services',
      totalCost: otherTotal,
      totalUsage: otherUsage,
      currency: services[0].currency,
      dailyBreakdown: [],
    });
  }

  return top;
};

/**
 * Prepare data for service breakdown chart (Pie/Donut)
 */
export const prepareServiceChartData = (services: Service[]): ChartDataPoint[] => {
  if (!services || services.length === 0) return [];

  const grouped = groupServices(services, 10);
  const totalCost = grouped.reduce((sum, s) => sum + s.totalCost, 0);

  return grouped.map((service, index) => ({
    name: service.serviceName,
    value: service.totalCost,
    percentage: ((service.totalCost / totalCost) * 100).toFixed(1),
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));
};

/**
 * Prepare time series data for cost trend chart
 */
export const prepareTimeSeriesData = (services: Service[], topN: number = 5): TimeSeriesDataPoint[] => {
  if (!services || services.length === 0) return [];

  const topServices = services
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, topN);

  if (topServices.length === 0 || !topServices[0].dailyBreakdown) return [];

  const dates = topServices[0].dailyBreakdown.map(d => d.date);

  return dates.map(date => {
    const dataPoint: TimeSeriesDataPoint = { date: formatChartDate(date) };

    topServices.forEach(service => {
      const dayData = service.dailyBreakdown.find(d => d.date === date);
      dataPoint[service.serviceName] = Number(dayData?.cost || 0);
    });

    return dataPoint;
  });
};

/**
 * Prepare EC2 instance data for table with calculated fields
 */
export const prepareEC2TableData = (instances: EC2Instance[]): TableEC2Instance[] => {
  if (!instances || !Array.isArray(instances)) return [];

  return instances
    .filter(instance => instance && instance.instanceId)
    .map(instance => {
      const costPerHour = instance.totalUsageHours > 0
        ? instance.totalCost / instance.totalUsageHours
        : 0;

      const dailyCosts = instance.dailyCosts?.map(d => parseFloat(d?.cost || '0')) || [];
      const dailyAverage = dailyCosts.length > 0
        ? dailyCosts.reduce((sum, cost) => sum + cost, 0) / dailyCosts.length
        : 0;

      const trend = dailyCosts.slice(-7); // Last 7 days for sparkline

      return {
        ...instance,
        costPerHour,
        dailyAverage,
        trend,
      };
    });
};

/**
 * Detect resource type from resource ID
 */
export const detectResourceType = (resourceId: string): string => {
  if (!resourceId || typeof resourceId !== 'string') return 'Unknown';
  if (resourceId.startsWith('i-')) return 'EC2 Instance';
  if (resourceId.startsWith('vol-')) return 'EBS Volume';
  if (resourceId.startsWith('snap-')) return 'EBS Snapshot';
  if (resourceId.startsWith('ami-')) return 'AMI';
  if (resourceId.includes('s3') || resourceId.includes('bucket')) return 'S3 Bucket';
  if (resourceId.startsWith('db-')) return 'RDS Instance';
  if (resourceId.startsWith('arn:aws:lambda')) return 'Lambda Function';
  if (resourceId.startsWith('arn:aws:elasticloadbalancing')) return 'Load Balancer';
  if (resourceId.startsWith('nat-')) return 'NAT Gateway';
  if (resourceId.startsWith('igw-')) return 'Internet Gateway';
  if (resourceId.startsWith('vpc-')) return 'VPC';
  return 'Unknown';
};

/**
 * Prepare resource data for table with calculated fields
 */
export const prepareResourceTableData = (resources: Resource[]): TableResource[] => {
  if (!resources || !Array.isArray(resources)) return [];

  return resources
    .filter(resource => resource && resource.resourceId)
    .map(resource => {
      const dailyCosts = resource.dailyCosts?.map(d => parseFloat(d?.cost || '0')) || [];
      const dailyAverage = dailyCosts.length > 0
        ? dailyCosts.reduce((sum, cost) => sum + cost, 0) / dailyCosts.length
        : 0;

      const trend = dailyCosts.slice(-7); // Last 7 days for sparkline

      return {
        ...resource,
        resourceType: detectResourceType(resource.resourceId),
        dailyAverage,
        trend,
      };
    });
};

/**
 * Export table data to CSV
 */
export const exportToCSV = (data: any[], filename: string): void => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Chart color palette
 */
export const CHART_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // green
  '#06b6d4', // cyan
  '#6366f1', // indigo
  '#a855f7', // violet
  '#14b8a6', // teal
  '#f97316', // orange
];

/**
 * Get top N items from array
 */
export const getTopN = <T>(arr: T[], n: number, sortBy: (item: T) => number): T[] => {
  return [...arr].sort((a, b) => sortBy(b) - sortBy(a)).slice(0, n);
};

/**
 * Calculate daily average from daily breakdown
 */
export const calculateDailyAverage = (dailyData: { cost: string }[]): number => {
  if (!dailyData || dailyData.length === 0) return 0;
  const total = dailyData.reduce((sum, d) => sum + parseFloat(d.cost || '0'), 0);
  return total / dailyData.length;
};

/**
 * Truncate long text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Check if cost is above threshold (for highlighting)
 */
export const isHighCost = (cost: number, threshold: number = 100): boolean => {
  return cost >= threshold;
};

/**
 * Sort array by multiple criteria
 */
export const multiSort = <T>(
  arr: T[],
  comparators: ((a: T, b: T) => number)[]
): T[] => {
  return [...arr].sort((a, b) => {
    for (const comparator of comparators) {
      const result = comparator(a, b);
      if (result !== 0) return result;
    }
    return 0;
  });
};
