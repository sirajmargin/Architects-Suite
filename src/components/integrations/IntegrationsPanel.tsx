'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Github, FileText, Globe, Settings, CheckCircle, XCircle, Sync } from 'lucide-react';
import { integrationService, IntegrationConfig } from '@/services/integrationService';
import { useToast } from '@/hooks/use-toast';

interface IntegrationsPanelProps {
  diagramCode: string;
  diagramTitle: string;
  onSync?: (platform: string, result: any) => void;
}

export function IntegrationsPanel({ 
  diagramCode, 
  diagramTitle, 
  onSync 
}: IntegrationsPanelProps) {
  const { toast } = useToast();
  const [config, setConfig] = useState<IntegrationConfig>({});
  const [connections, setConnections] = useState<{ [key: string]: boolean }>({});
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState<{ [key: string]: boolean }>({});
  const [autoSync, setAutoSync] = useState({
    github: false,
    notion: false,
    confluence: false
  });

  useEffect(() => {
    // Load saved configuration
    const savedConfig = localStorage.getItem('integrations-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
        integrationService.updateConfig(parsed);
      } catch (error) {
        console.error('Failed to load integration config:', error);
      }
    }

    // Load auto-sync settings
    const savedAutoSync = localStorage.getItem('auto-sync-settings');
    if (savedAutoSync) {
      try {
        setAutoSync(JSON.parse(savedAutoSync));
      } catch (error) {
        console.error('Failed to load auto-sync settings:', error);
      }
    }
  }, []);

  const saveConfig = (newConfig: IntegrationConfig) => {
    setConfig(newConfig);
    integrationService.updateConfig(newConfig);
    localStorage.setItem('integrations-config', JSON.stringify(newConfig));
  };

  const saveAutoSyncSettings = (newSettings: typeof autoSync) => {
    setAutoSync(newSettings);
    localStorage.setItem('auto-sync-settings', JSON.stringify(newSettings));
  };

  const testConnections = async () => {
    setIsTesting(true);
    try {
      const results = await integrationService.testConnections();
      setConnections(results);
      
      const successCount = Object.values(results).filter(Boolean).length;
      const totalCount = Object.keys(results).length;
      
      toast({
        title: 'Connection Test Complete',
        description: `${successCount}/${totalCount} integrations connected successfully`
      });
    } catch (error) {
      toast({
        title: 'Test Failed',
        description: 'Failed to test connections',
        variant: 'destructive'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const syncToPlatform = async (platform: 'github' | 'notion' | 'confluence') => {
    setIsSyncing(prev => ({ ...prev, [platform]: true }));
    
    try {
      let result;
      
      switch (platform) {
        case 'github':
          result = await integrationService.syncToGitHub(
            diagramCode,
            diagramTitle.toLowerCase().replace(/\s+/g, '-'),
            `Update ${diagramTitle} diagram`
          );
          break;
        case 'notion':
          result = await integrationService.syncToNotion(
            diagramCode,
            diagramTitle,
            'Diagram created in Architects Suite'
          );
          break;
        case 'confluence':
          result = await integrationService.syncToConfluence(
            diagramCode,
            diagramTitle,
            'Diagram created in Architects Suite'
          );
          break;
      }

      if (result.success) {
        toast({
          title: 'Sync Successful',
          description: result.message
        });
        onSync?.(platform, result);
      } else {
        toast({
          title: 'Sync Failed',
          description: result.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsSyncing(prev => ({ ...prev, [platform]: false }));
    }
  };

  const ConnectionStatus = ({ platform }: { platform: string }) => {
    const isConnected = connections[platform];
    return (
      <div className="flex items-center gap-2">
        {isConnected ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
        <Badge variant={isConnected ? 'default' : 'secondary'}>
          {isConnected ? 'Connected' : 'Not Connected'}
        </Badge>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Integrations</h3>
        <Button onClick={testConnections} disabled={isTesting} variant="outline" size="sm">
          {isTesting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
          ) : (
            <Settings className="h-4 w-4 mr-2" />
          )}
          Test Connections
        </Button>
      </div>

      <Tabs defaultValue="github" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="github">GitHub</TabsTrigger>
          <TabsTrigger value="notion">Notion</TabsTrigger>
          <TabsTrigger value="confluence">Confluence</TabsTrigger>
        </TabsList>

        <TabsContent value="github">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  <CardTitle>GitHub Integration</CardTitle>
                </div>
                <ConnectionStatus platform="github" />
              </div>
              <CardDescription>
                Sync diagrams to your GitHub repository as markdown files
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="github-token">Personal Access Token</Label>
                  <Input
                    id="github-token"
                    type="password"
                    value={config.github?.token || ''}
                    onChange={(e) =>
                      saveConfig({
                        ...config,
                        github: { ...config.github!, token: e.target.value }
                      })
                    }
                    placeholder="ghp_xxxxxxxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github-owner">Repository Owner</Label>
                  <Input
                    id="github-owner"
                    value={config.github?.owner || ''}
                    onChange={(e) =>
                      saveConfig({
                        ...config,
                        github: { ...config.github!, owner: e.target.value }
                      })
                    }
                    placeholder="username"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="github-repo">Repository Name</Label>
                <Input
                  id="github-repo"
                  value={config.github?.repo || ''}
                  onChange={(e) =>
                    saveConfig({
                      ...config,
                      github: { ...config.github!, repo: e.target.value }
                    })
                  }
                  placeholder="my-documentation"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="github-auto-sync"
                    checked={autoSync.github}
                    onCheckedChange={(checked) =>
                      saveAutoSyncSettings({ ...autoSync, github: checked })
                    }
                  />
                  <Label htmlFor="github-auto-sync">Auto-sync on save</Label>
                </div>
                <Button
                  onClick={() => syncToPlatform('github')}
                  disabled={!config.github?.token || isSyncing.github}
                >
                  {isSyncing.github ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <Sync className="h-4 w-4 mr-2" />
                  )}
                  Sync Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notion">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <CardTitle>Notion Integration</CardTitle>
                </div>
                <ConnectionStatus platform="notion" />
              </div>
              <CardDescription>
                Add diagrams to your Notion workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notion-token">Integration Token</Label>
                <Input
                  id="notion-token"
                  type="password"
                  value={config.notion?.token || ''}
                  onChange={(e) =>
                    saveConfig({
                      ...config,
                      notion: { ...config.notion!, token: e.target.value }
                    })
                  }
                  placeholder="secret_xxxxxxxxxxxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notion-page">Default Page ID (optional)</Label>
                <Input
                  id="notion-page"
                  value={config.notion?.pageId || ''}
                  onChange={(e) =>
                    saveConfig({
                      ...config,
                      notion: { ...config.notion!, pageId: e.target.value }
                    })
                  }
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="notion-auto-sync"
                    checked={autoSync.notion}
                    onCheckedChange={(checked) =>
                      saveAutoSyncSettings({ ...autoSync, notion: checked })
                    }
                  />
                  <Label htmlFor="notion-auto-sync">Auto-sync on save</Label>
                </div>
                <Button
                  onClick={() => syncToPlatform('notion')}
                  disabled={!config.notion?.token || isSyncing.notion}
                >
                  {isSyncing.notion ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <Sync className="h-4 w-4 mr-2" />
                  )}
                  Sync Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="confluence">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <CardTitle>Confluence Integration</CardTitle>
                </div>
                <ConnectionStatus platform="confluence" />
              </div>
              <CardDescription>
                Publish diagrams to your Confluence space
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="confluence-url">Base URL</Label>
                <Input
                  id="confluence-url"
                  value={config.confluence?.baseUrl || ''}
                  onChange={(e) =>
                    saveConfig({
                      ...config,
                      confluence: { ...config.confluence!, baseUrl: e.target.value }
                    })
                  }
                  placeholder="https://your-domain.atlassian.net"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="confluence-token">API Token</Label>
                  <Input
                    id="confluence-token"
                    type="password"
                    value={config.confluence?.token || ''}
                    onChange={(e) =>
                      saveConfig({
                        ...config,
                        confluence: { ...config.confluence!, token: e.target.value }
                      })
                    }
                    placeholder="xxxxxxxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confluence-space">Space Key</Label>
                  <Input
                    id="confluence-space"
                    value={config.confluence?.spaceKey || ''}
                    onChange={(e) =>
                      saveConfig({
                        ...config,
                        confluence: { ...config.confluence!, spaceKey: e.target.value }
                      })
                    }
                    placeholder="MYSPACE"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="confluence-auto-sync"
                    checked={autoSync.confluence}
                    onCheckedChange={(checked) =>
                      saveAutoSyncSettings({ ...autoSync, confluence: checked })
                    }
                  />
                  <Label htmlFor="confluence-auto-sync">Auto-sync on save</Label>
                </div>
                <Button
                  onClick={() => syncToPlatform('confluence')}
                  disabled={!config.confluence?.token || isSyncing.confluence}
                >
                  {isSyncing.confluence ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <Sync className="h-4 w-4 mr-2" />
                  )}
                  Sync Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}