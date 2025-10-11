// AWS Cost Analysis Dashboard Type Definitions

export interface DailyData {
  date: string;
  cost: string;
  usage?: string;
}

export interface Service {
  serviceName: string;
  totalCost: number;
  totalUsage: number;
  currency: string;
  dailyBreakdown: DailyData[];
}

export interface Resource {
  resourceId: string;
  totalCost: number;
  currency: string;
  dailyCosts: { date: string; cost: string }[];
}

export interface EC2Instance {
  instanceId: string;
  totalCost: number;
  totalUsageHours: number;
  currency: string;
  usageTypes: string[];
  dailyCosts: DailyData[];
}

export interface EC2Analysis {
  instances: EC2Instance[];
  totalEC2Cost: string;
  totalInstances: number;
}

export interface Forecast {
  forecast: { date: string; meanValue: string }[];
  total: string;
  currency: string;
  period: { startDate: string; endDate: string };
}

export interface CostOverview {
  totalCost: string;
  currency: string;
  period: { startDate: string; endDate: string };
}

export interface CostDashboardData {
  overview: CostOverview;
  serviceBreakdown: Service[];
  topResources: Resource[];
  ec2Analysis: EC2Analysis;
  forecast: Forecast;
}

export interface CostDashboardResponse {
  success: boolean;
  data: CostDashboardData;
}

export interface ComparisonData {
  current: {
    totalCost: number;
    period: { startDate: string; endDate: string };
    services: Service[];
  };
  previous: {
    totalCost: number;
    period: { startDate: string; endDate: string };
    services: Service[];
  };
  percentageChange: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  percentage?: string;
  color?: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  [serviceName: string]: string | number;
}

export interface TableEC2Instance extends EC2Instance {
  costPerHour: number;
  dailyAverage: number;
  trend: number[];
}

export interface TableResource extends Resource {
  resourceType: string;
  dailyAverage: number;
  trend: number[];
}

export type DateRangeOption = '7' | '30' | '60' | '90' | 'custom';

export interface DateRangeConfig {
  label: string;
  days: number;
}
