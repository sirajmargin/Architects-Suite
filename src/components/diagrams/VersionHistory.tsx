'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  History, 
  RotateCcw, 
  GitBranch, 
  Clock, 
  User, 
  ChevronRight,
  ChevronDown,
  Play,
  Eye,
  Download,
  Tag,
  MessageSquare
} from 'lucide-react';
import { DiagramVersion, DiagramContent, User as UserType } from '@/types';
import { formatRelativeTime } from '@/lib/utils';

interface VersionHistoryProps {
  diagramId: string;
  currentContent: DiagramContent;
  onVersionRestore: (version: DiagramVersion) => void;
  onVersionPreview: (version: DiagramVersion) => void;
  currentUser: UserType;
}

interface VersionWithDiff {
  version: DiagramVersion;
  changes: {
    added: number;
    modified: number;
    deleted: number;
  };
  isExpanded?: boolean;
}

export function VersionHistory({
  diagramId,
  currentContent,
  onVersionRestore,
  onVersionPreview,
  currentUser
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<VersionWithDiff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);

  useEffect(() => {
    loadVersionHistory();
  }, [diagramId]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled) return;

    const autoSaveInterval = setInterval(() => {
      createAutoSnapshot();
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [autoSaveEnabled, currentContent]);

  const loadVersionHistory = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/diagrams/${diagramId}/versions`);
      const data = await response.json();
      
      if (data.success) {
        const versionsWithDiff = await Promise.all(
          data.versions.map(async (version: DiagramVersion) => ({
            version,
            changes: await calculateChanges(version),
            isExpanded: false
          }))
        );
        
        setVersions(versionsWithDiff);
      }
    } catch (error) {
      console.error('Failed to load version history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateChanges = async (version: DiagramVersion) => {
    // Calculate differences between versions
    // This is a simplified implementation - in production, you'd use a proper diff algorithm
    const currentNodes = currentContent.nodes || [];
    const versionNodes = version.content.nodes || [];
    
    const added = versionNodes.filter(vn => 
      !currentNodes.some(cn => cn.id === vn.id)
    ).length;
    
    const deleted = currentNodes.filter(cn => 
      !versionNodes.some(vn => vn.id === cn.id)
    ).length;
    
    const modified = versionNodes.filter(vn => 
      currentNodes.some(cn => cn.id === vn.id && 
        JSON.stringify(cn.data) !== JSON.stringify(vn.data))
    ).length;

    return { added, modified, deleted };
  };

  const createSnapshot = async (message?: string) => {
    setIsCreatingSnapshot(true);
    
    try {
      const response = await fetch(`/api/diagrams/${diagramId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: currentContent,
          message: message || 'Manual snapshot',
          createdBy: currentUser.id
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        await loadVersionHistory();
        setLastSaveTime(new Date());
      }
    } catch (error) {
      console.error('Failed to create snapshot:', error);
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  const createAutoSnapshot = async () => {
    // Only create auto-snapshot if there have been changes
    if (!hasUnsavedChanges()) return;
    
    await createSnapshot('Auto-save');
  };

  const hasUnsavedChanges = (): boolean => {
    if (!lastSaveTime) return true;
    
    // Simple check - in production, you'd compare content hashes
    return new Date().getTime() - lastSaveTime.getTime() > 60000; // 1 minute
  };

  const restoreVersion = async (version: DiagramVersion) => {
    if (confirm(`Are you sure you want to restore to version ${version.version}? Current changes will be lost.`)) {
      onVersionRestore(version);
      
      // Create a new snapshot marking the restoration
      await createSnapshot(`Restored to version ${version.version}`);
    }
  };

  const previewVersion = (version: DiagramVersion) => {
    setSelectedVersion(version.id);
    onVersionPreview(version);
  };

  const toggleVersionExpansion = (versionId: string) => {
    setVersions(prev => prev.map(v => 
      v.version.id === versionId 
        ? { ...v, isExpanded: !v.isExpanded }
        : v
    ));
  };

  const exportVersionHistory = async () => {
    try {
      const response = await fetch(`/api/diagrams/${diagramId}/versions/export`);
      const blob = await response.blob();
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diagram-${diagramId}-history.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export version history:', error);
    }
  };

  const createTaggedVersion = async () => {
    const tag = prompt('Enter a tag name for this version:');
    if (tag) {
      await createSnapshot(`Tagged: ${tag}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <div className="text-sm text-gray-600">Loading version history...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <History className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium">Version History</h3>
          <span className="text-sm text-gray-500">({versions.length} versions)</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
          >
            <Clock className="h-4 w-4 mr-1" />
            Auto-save: {autoSaveEnabled ? 'On' : 'Off'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={createTaggedVersion}
          >
            <Tag className="h-4 w-4 mr-1" />
            Tag Version
          </Button>
          
          <Button
            size="sm"
            onClick={() => createSnapshot()}
            disabled={isCreatingSnapshot}
          >
            {isCreatingSnapshot ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
            ) : (
              <GitBranch className="h-4 w-4 mr-1" />
            )}
            Create Snapshot
          </Button>
        </div>
      </div>

      {/* Auto-save Status */}
      {autoSaveEnabled && (
        <Alert className="border-blue-200 bg-blue-50">
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span className="text-blue-800">
                Auto-save enabled - Last saved: {lastSaveTime ? formatRelativeTime(lastSaveTime) : 'Never'}
              </span>
              {hasUnsavedChanges() && (
                <span className="text-xs text-blue-600 font-medium">Unsaved changes detected</span>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Version List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {versions.map((versionData) => {
          const { version, changes, isExpanded } = versionData;
          const isSelected = selectedVersion === version.id;
          
          return (
            <Card 
              key={version.id} 
              className={`cursor-pointer transition-all duration-200 ${
                isSelected ? 'border-blue-500 shadow-md' : 'hover:shadow-sm'
              }`}
            >
              <CardHeader 
                className="pb-2 cursor-pointer"
                onClick={() => toggleVersionExpansion(version.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button variant="ghost" size="sm" className="p-0 h-auto">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <div>
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <span>Version {version.version}</span>
                        {version.message?.includes('Tagged:') && (
                          <Tag className="h-3 w-3 text-blue-500" />
                        )}
                        {version.message?.includes('Auto-save') && (
                          <Clock className="h-3 w-3 text-green-500" />
                        )}
                      </CardTitle>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {version.createdBy}
                        </span>
                        <span>{formatRelativeTime(version.createdAt)}</span>
                        
                        {/* Change Summary */}
                        <div className="flex items-center space-x-2">
                          {changes.added > 0 && (
                            <span className="text-green-600">+{changes.added}</span>
                          )}
                          {changes.modified > 0 && (
                            <span className="text-yellow-600">~{changes.modified}</span>
                          )}
                          {changes.deleted > 0 && (
                            <span className="text-red-600">-{changes.deleted}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        previewVersion(version);
                      }}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        restoreVersion(version);
                      }}
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Version Message */}
                    {version.message && (
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                        <p className="text-sm text-gray-700">{version.message}</p>
                      </div>
                    )}
                    
                    {/* Content Summary */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium">{version.content.nodes?.length || 0}</div>
                        <div className="text-xs text-gray-500">Nodes</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium">{version.content.edges?.length || 0}</div>
                        <div className="text-xs text-gray-500">Connections</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium">{version.content.code?.split('\n').length || 0}</div>
                        <div className="text-xs text-gray-500">Lines</div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => previewVersion(version)}
                        className={isSelected ? 'bg-blue-50 border-blue-300' : ''}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        {isSelected ? 'Previewing' : 'Preview'}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => restoreVersion(version)}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Restore
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportVersionHistory}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {versions.length === 0 && (
        <div className="text-center py-8">
          <History className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No version history yet</p>
          <p className="text-sm text-gray-400">Create your first snapshot to start tracking changes</p>
        </div>
      )}
    </div>
  );
}