export interface Packet {
  id: string;
  timestamp: number;
  protocol: "TCP" | "UDP" | "ICMP" | "DNS" | "HTTP" | "SSH";
  srcIp: string;
  srcPort: number;
  dstIp: string;
  dstPort: number;
  length: number;
  flags: string[];
  payload: string;
  anomalyScore: number;
  signatureMatched?: string;
  ruleId?: string;
}

export interface Rule {
  id: string;
  name: string;
  protocol: string;
  srcIp: string;
  srcPort: string;
  dstIp: string;
  dstPort: string;
  pattern: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  category: string;
  mitreAttackId?: string;
  enabled: boolean;
}

export interface Alert {
  id: string;
  timestamp: number;
  packetId?: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  category: string;
  message: string;
  srcIp: string;
  srcPort: number;
  dstIp: string;
  dstPort: number;
  protocol: string;
  mitreAttackId?: string;
  anomalyScore: number;
  status: "OPEN" | "INVESTIGATING" | "REMEDIATED" | "SUPPRESSED";
  geoIp?: {
    country: string;
    city: string;
    countryCode: string;
    lat: number;
    lon: number;
    asn: string;
  };
}

export interface Incident {
  id: string;
  title: string;
  status: "OPEN" | "INVESTIGATING" | "REMEDIATED" | "CLOSED";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  createdTime: number;
  updatedTime: number;
  assignedAnalyst?: string;
  alertsCount: number;
  threatActor?: string;
  mitreTactics: string[];
  description: string;
  remediationPlaybook?: string;
  alertIds: string[];
  notes: Array<{
    id: string;
    author: string;
    timestamp: number;
    text: string;
  }>;
}

export interface MLModelStats {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  falsePositiveRate: number;
  lastTrained: number;
  trainingDuration: number;
  samplesUsed: number;
  hyperparameters: {
    nEstimators: number;
    contamination: number;
    maxFeatures: number;
    learningRate: number;
    epochs: number;
  };
}

export interface SecurityMetrics {
  pps: number;
  bandwidthMbps: number;
  threatScore: number;
  riskLevel: string;
  severityDistribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  protocolDistribution: {
    TCP: number;
    UDP: number;
    DNS: number;
    HTTP: number;
    SSH: number;
    ICMP: number;
  };
  topAttackers: Array<{
    ip: string;
    count: number;
    country: string;
    geo?: {
      country: string;
      city: string;
      countryCode: string;
      lat: number;
      lon: number;
      asn: string;
    };
  }>;
  activeAlertsCount: number;
  totalAlertsProcessed: number;
  totalPacketsInspected: number;
  mlModelThreshold: number;
  operatingMode?: "LIVE" | "DEMO";
}
