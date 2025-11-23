
export enum NodeType {
  MOBILE = 'Smartphone',
  DESKTOP = 'Workstation',
  SERVER = 'Server Node',
  IOT = 'IoT Device'
}

export enum NodeStatus {
  ACTIVE = 'Aktif',
  SYNCING = 'Sinkronisasi',
  OFFLINE = 'Offline',
  COMPROMISED = 'Terinfeksi', // New: Node hit by malware
  RECOVERING = 'Pemulihan'    // New: Node being patched
}

export interface NetworkNode {
  id: string;
  type: NodeType;
  ip: string;
  location: string; // New: City/Country name
  lat: number;      // New: Latitude
  lng: number;      // New: Longitude
  status: NodeStatus;
  contribution: number; // Hash power contribution
  dataProcessed: string; // New: Total Encrypted Data (e.g., "1.5 TB")
  totalEarnings: number; // New: Total Revenue (e.g., DST tokens)
  joinedAt: Date;
}

export interface EncryptedPayload {
  originalHash: string;
  encryptedData: string;
  shards: number;
  strengthLevel: string; // "Weak", "Moderate", "Strong", "Military Grade"
  timestamp: number;
}

export interface AuditReport {
  securityScore: number; // 0-100
  analysis: string;
  recommendations: string[];
}
