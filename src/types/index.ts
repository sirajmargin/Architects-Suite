// Core Entity Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user' | 'viewer';
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  settings: OrganizationSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationSettings {
  samlEnabled: boolean;
  ssoProvider?: string;
  integrations: {
    github: boolean;
    notion: boolean;
    confluence: boolean;
  };
  security: {
    requireSaml: boolean;
    allowedDomains: string[];
  };
}

// Diagram Types
export type DiagramType = 
  | 'flowchart'
  | 'sequence'
  | 'erd'
  | 'uml'
  | 'cloud-architecture'
  | 'component'
  | 'network'
  | 'mindmap';

export interface Diagram {
  id: string;
  title: string;
  description?: string;
  type: DiagramType;
  content: DiagramContent;
  metadata: DiagramMetadata;
  permissions: DiagramPermissions;
  organizationId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DiagramContent {
  code?: string; // Diagram-as-code content
  visual?: any; // Visual editor data
  nodes?: DiagramNode[];
  edges?: DiagramEdge[];
  layout?: DiagramLayout;
}

export interface DiagramNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
  style?: any;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: any;
  style?: any;
}

export interface DiagramLayout {
  direction: 'TB' | 'LR' | 'BT' | 'RL';
  spacing: number;
  alignment: 'start' | 'center' | 'end';
}

export interface DiagramMetadata {
  tags: string[];
  category?: string;
  version: number;
  isPublic: boolean;
  exportFormats: ExportFormat[];
  integrations: {
    github?: {
      repository: string;
      path: string;
      branch: string;
    };
    notion?: {
      pageId: string;
    };
    confluence?: {
      spaceKey: string;
      pageId: string;
    };
  };
}

export interface DiagramPermissions {
  read: string[];
  write: string[];
  admin: string[];
  public: boolean;
}

// Version History
export interface DiagramVersion {
  id: string;
  diagramId: string;
  version: number;
  content: DiagramContent;
  message?: string;
  createdBy: string;
  createdAt: Date;
}

// Collaboration Types
export interface CollaborationSession {
  id: string;
  diagramId: string;
  participants: Participant[];
  startedAt: Date;
  endedAt?: Date;
}

export interface Participant {
  userId: string;
  user: User;
  joinedAt: Date;
  lastActivity: Date;
  cursor?: { x: number; y: number };
  selection?: string[];
}

export interface CollaborationEvent {
  id: string;
  sessionId: string;
  type: 'cursor' | 'selection' | 'edit' | 'comment';
  userId: string;
  data: any;
  timestamp: Date;
}

export interface Comment {
  id: string;
  diagramId: string;
  userId: string;
  content: string;
  position?: { x: number; y: number };
  resolved: boolean;
  replies: CommentReply[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentReply {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
}

// AI Generation Types
export interface AIGenerationRequest {
  type: 'code-to-diagram' | 'text-to-diagram' | 'enhancement';
  input: string;
  diagramType: DiagramType;
  options?: {
    style?: string;
    complexity?: 'simple' | 'detailed' | 'comprehensive';
    includeLabels?: boolean;
    colorScheme?: string;
  };
}

export interface AIGenerationResponse {
  success: boolean;
  diagram?: DiagramContent;
  suggestions?: string[];
  error?: string;
}

// Export Types
export type ExportFormat = 'png' | 'svg' | 'pdf' | 'markdown' | 'json';

export interface ExportOptions {
  filename?: string;
  title?: string;
  description?: string;
  scale?: number;
  quality?: number;
  backgroundColor?: string;
  orientation?: 'portrait' | 'landscape';
  pageSize?: string;
  width?: number;
  height?: number;
  includeMetadata?: boolean;
  notes?: string;
  diagramType?: DiagramType;
  version?: string;
  theme?: string;
  layout?: string;
}

// Integration Types
export interface GitHubIntegration {
  repository: string;
  path: string;
  branch: string;
  autoSync: boolean;
  webhook?: {
    url: string;
    secret: string;
  };
}

export interface NotionIntegration {
  workspaceId: string;
  pageId: string;
  autoSync: boolean;
}

export interface ConfluenceIntegration {
  baseUrl: string;
  spaceKey: string;
  pageId: string;
  autoSync: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Editor Types
export interface EditorState {
  mode: 'code' | 'visual' | 'split';
  activeTab: string;
  zoom: number;
  selection: string[];
  clipboard?: any;
}

export interface CodeEditorLanguage {
  id: string;
  name: string;
  extensions: string[];
  syntax: 'mermaid' | 'plantuml' | 'graphviz' | 'custom';
}

// Deployment Types
export interface DeploymentConfig {
  type: 'multi-tenant' | 'single-tenant' | 'private-cloud';
  settings: {
    customDomain?: string;
    ssl: boolean;
    backup: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly';
      retention: number;
    };
    monitoring: {
      enabled: boolean;
      alerting: boolean;
    };
  };
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// Socket.IO Types
export interface SocketEvents {
  // Collaboration
  'diagram:join': { diagramId: string };
  'diagram:leave': { diagramId: string };
  'diagram:cursor': { diagramId: string; cursor: { x: number; y: number } };
  'diagram:edit': { diagramId: string; changes: any };
  'diagram:comment': { diagramId: string; comment: Comment };
  
  // Notifications
  'notification:new': { type: string; message: string; data?: any };
  
  // System
  'user:connected': { userId: string };
  'user:disconnected': { userId: string };
}