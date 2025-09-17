'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  Clock, 
  Users, 
  Settings,
  Bell,
  User,
  FileText,
  Database,
  GitBranch,
  Share2,
  Zap,
  Brain,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';

interface Diagram {
  id: string;
  title: string;
  type: string;
  description?: string;
  lastModified: Date;
  isStarred: boolean;
  isShared: boolean;
  collaborators: number;
  thumbnail?: string;
}

interface DashboardStats {
  totalDiagrams: number;
  sharedDiagrams: number;
  collaborators: number;
  aiGeneratedDiagrams: number;
}

export function Dashboard() {
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalDiagrams: 0,
    sharedDiagrams: 0,
    collaborators: 0,
    aiGeneratedDiagrams: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<string>('all');
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    loadAISuggestions();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load user's diagrams
      const diagramsResponse = await fetch('/api/diagrams');
      const diagramsData = await diagramsResponse.json();
      
      if (diagramsData.success) {
        setDiagrams(diagramsData.data);
      }
      
      // Load dashboard stats
      const statsResponse = await fetch('/api/dashboard/stats');
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAISuggestions = async () => {
    try {
      const response = await fetch('/api/ai/dashboard-suggestions');
      const data = await response.json();
      
      if (data.success) {
        setAiSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Failed to load AI suggestions:', error);
    }
  };

  const handleCreateDiagram = (type: string) => {
    // Navigate to diagram creation with AI assistance
    window.location.href = `/diagrams/create?type=${type}&ai=true`;
  };

  const handleAIGenerate = () => {
    // Navigate to AI-powered diagram generation
    window.location.href = '/diagrams/ai-generate';
  };

  const filteredDiagrams = diagrams.filter(diagram => {
    const matchesSearch = diagram.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         diagram.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || diagram.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Architects Suite</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Suggestions */}
        {aiSuggestions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <Brain className="h-5 w-5 inline mr-2" />
              AI Recommendations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {aiSuggestions.slice(0, 3).map((suggestion, index) => (
                <Alert key={index} className="border-blue-200 bg-blue-50">
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-900">{suggestion.title}</p>
                        <p className="text-sm text-blue-700">{suggestion.description}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleAIGenerate()}>
                        Try Now
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Diagrams</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDiagrams}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shared Diagrams</CardTitle>
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sharedDiagrams}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collaborators</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.collaborators}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Generated</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.aiGeneratedDiagrams}</div>
            </CardContent>
          </Card>
        </div>

        {/* Create Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Diagram</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center"
              onClick={() => handleCreateDiagram('flowchart')}
            >
              <GitBranch className="h-6 w-6 mb-2" />
              Flowchart
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center"
              onClick={() => handleCreateDiagram('sequence')}
            >
              <Clock className="h-6 w-6 mb-2" />
              Sequence
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center"
              onClick={() => handleCreateDiagram('erd')}
            >
              <Database className="h-6 w-6 mb-2" />
              ERD
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center"
              onClick={() => handleCreateDiagram('cloud')}
            >
              <Settings className="h-6 w-6 mb-2" />
              Cloud
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center"
              onClick={handleAIGenerate}
            >
              <Brain className="h-6 w-6 mb-2" />
              AI Generate
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center"
              onClick={() => handleCreateDiagram('custom')}
            >
              <Plus className="h-6 w-6 mb-2" />
              Custom
            </Button>
          </div>
        </div>

        {/* Diagrams Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Diagrams</h2>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search diagrams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
              
              <div className="flex rounded-md shadow-sm">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading diagrams...</p>
            </div>
          ) : filteredDiagrams.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No diagrams found</p>
              <Button onClick={() => handleCreateDiagram('flowchart')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Diagram
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDiagrams.map((diagram) => (
                <Card key={diagram.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{diagram.title}</CardTitle>
                      <div className="flex items-center space-x-1">
                        {diagram.isStarred && <Star className="h-4 w-4 text-yellow-500" />}
                        {diagram.isShared && <Share2 className="h-4 w-4 text-blue-500" />}
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {diagram.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{diagram.type}</span>
                      <div className="flex items-center space-x-2">
                        {diagram.collaborators > 0 && (
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {diagram.collaborators}
                          </span>
                        )}
                        <span>{new Date(diagram.lastModified).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDiagrams.map((diagram) => (
                <Card key={diagram.id} className="hover:bg-gray-50 cursor-pointer">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-medium">{diagram.title}</h3>
                        <p className="text-sm text-gray-500">{diagram.description || 'No description'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{diagram.type}</span>
                      {diagram.collaborators > 0 && (
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {diagram.collaborators}
                        </span>
                      )}
                      <span>{new Date(diagram.lastModified).toLocaleDateString()}</span>
                      <div className="flex items-center space-x-1">
                        {diagram.isStarred && <Star className="h-4 w-4 text-yellow-500" />}
                        {diagram.isShared && <Share2 className="h-4 w-4 text-blue-500" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}