'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
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
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [aiGenerating, setAiGenerating] = useState(false);
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
        setDiagrams(diagramsData.diagrams || []);
      }
      
      // Load dashboard stats
      const statsResponse = await fetch('/api/dashboard/stats');
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setStats(statsData.stats || {
          totalDiagrams: 0,
          sharedDiagrams: 0,
          collaborators: 0,
          aiGeneratedDiagrams: 0
        });
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

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      setShowAiPrompt(true);
      return;
    }

    setAiGenerating(true);
    try {
      const aiServiceUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:3001';
      const response = await fetch(`${aiServiceUrl}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        sessionStorage.setItem('aiGeneratedContent', JSON.stringify(result.content));
        sessionStorage.setItem('aiPrompt', aiPrompt);
        const params = new URLSearchParams({
          type: 'cloud-architecture',
          ai: 'true',
          prompt: aiPrompt
        });
        window.location.href = `/diagrams/create?${params.toString()}`;
      } else {
        console.error('AI Generation Error:', result);
        alert('Failed to generate diagram: ' + (result.error || 'Service unavailable'));
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      alert('Failed to generate diagram. Please try again.');
    } finally {
      setAiGenerating(false);
    }
  };

  const filteredDiagrams = (diagrams || []).filter(diagram => {
    const matchesSearch = diagram.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         diagram.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || diagram.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="professional-header mx-4 mt-4 rounded-2xl sticky top-4 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-18">
            <div className="flex items-center space-x-4">
              <div className="icon-gradient w-12 h-12">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">Architects Suite</h1>
                <p className="text-sm text-gray-600 font-medium">AI-Powered Architecture Design</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="glass-card px-4 py-2 rounded-lg flex items-center space-x-2 hover:shadow-lg transition-all">
                <Bell className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Notifications</span>
              </button>
              
              <button className="glass-card px-4 py-2 rounded-lg flex items-center space-x-2 hover:shadow-lg transition-all">
                <Settings className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Settings</span>
              </button>
              
              <button className="btn-primary px-4 py-2 rounded-lg flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">Profile</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Suggestions */}
        {aiSuggestions.length > 0 && (
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                AI Recommendations
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {aiSuggestions.slice(0, 3).map((suggestion, index) => (
                <div key={index} className="glass-card p-6 rounded-2xl card-hover group border border-purple-200/50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:shadow-glow transition-all duration-300">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <Button variant="outline" size="sm" className="btn-primary text-xs" onClick={() => {
                      setAiPrompt(suggestion.title);
                      setShowAiPrompt(true);
                    }}>
                      Try Now
                    </Button>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{suggestion.title}</h3>
                  <p className="text-sm text-gray-600">{suggestion.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-slide-up">
          <div className="stat-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="icon-gradient w-14 h-14">
                <FileText className="h-7 w-7 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-2">{stats.totalDiagrams}</div>
            <p className="text-sm font-semibold text-gray-600">Total Diagrams</p>
          </div>
          
          <div className="stat-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="icon-gradient w-14 h-14">
                <Share2 className="h-7 w-7 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-2">{stats.sharedDiagrams}</div>
            <p className="text-sm font-semibold text-gray-600">Shared Diagrams</p>
          </div>
          
          <div className="stat-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="icon-gradient w-14 h-14">
                <Users className="h-7 w-7 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-2">{stats.collaborators}</div>
            <p className="text-sm font-semibold text-gray-600">Collaborators</p>
          </div>
          
          <div className="stat-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="icon-gradient w-14 h-14">
                <Brain className="h-7 w-7 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-2">{stats.aiGeneratedDiagrams}</div>
            <p className="text-sm font-semibold text-gray-600">AI Generated</p>
          </div>
        </div>

        {/* AI Prompt Section */}
        {showAiPrompt && (
          <div className="ai-prompt-card mb-8 p-8 rounded-3xl animate-slide-up">
            <div className="flex items-center gap-4 mb-6">
              <div className="icon-gradient w-16 h-16 shadow-glow">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold gradient-text">AI Diagram Generator</h3>
                <p className="text-lg text-gray-700 font-medium">Describe your architecture and watch AI create it instantly</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">Describe your architecture:</label>
                <Textarea
                  className="min-h-[120px] resize-none border-2 border-gray-200 focus:border-blue-400 rounded-xl p-4 text-base"
                  placeholder="✨ Try: 'Create a microservices e-commerce platform with user authentication, product catalog, shopping cart, payment processing, and order management using AWS services'"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleAIGenerate();
                    }
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <button 
                    onClick={handleAIGenerate} 
                    disabled={!aiPrompt.trim() || aiGenerating}
                    className="btn-primary px-6 py-3 text-base shadow-glow rounded-xl font-semibold flex items-center"
                  >
                    {aiGenerating ? (
                      <>
                        <div className="w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Generating Magic...
                      </>
                    ) : (
                      <>
                        <Brain className="h-5 w-5 mr-3" />
                        Generate Architecture
                      </>
                    )}
                  </button>
                  <Button variant="outline" onClick={() => setShowAiPrompt(false)} className="px-6 py-3">
                    Cancel
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <kbd className="px-2 py-1 bg-gray-100 rounded font-mono">Ctrl</kbd>
                  <span>+</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded font-mono">Enter</kbd>
                  <span>to generate</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Diagram</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div 
              className="create-card p-6 rounded-2xl cursor-pointer"
              onClick={() => handleCreateDiagram('flowchart')}
            >
              <div className="icon-gradient w-14 h-14 mb-4">
                <GitBranch className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 text-base mb-1">Flowchart</h3>
              <p className="text-sm text-gray-600">Process flows</p>
            </div>
            
            <div 
              className="create-card p-6 rounded-2xl cursor-pointer"
              onClick={() => handleCreateDiagram('sequence')}
            >
              <div className="icon-gradient w-14 h-14 mb-4">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 text-base mb-1">Sequence</h3>
              <p className="text-sm text-gray-600">Time-based</p>
            </div>
            
            <div 
              className="create-card p-6 rounded-2xl cursor-pointer"
              onClick={() => handleCreateDiagram('erd')}
            >
              <div className="icon-gradient w-14 h-14 mb-4">
                <Database className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 text-base mb-1">ERD</h3>
              <p className="text-sm text-gray-600">Data models</p>
            </div>
            
            <div 
              className="create-card p-6 rounded-2xl cursor-pointer"
              onClick={() => handleCreateDiagram('cloud')}
            >
              <div className="icon-gradient w-14 h-14 mb-4">
                <Settings className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 text-base mb-1">Cloud</h3>
              <p className="text-sm text-gray-600">Infrastructure</p>
            </div>
            
            <div 
              className="create-card p-6 rounded-2xl cursor-pointer border-gradient"
              onClick={() => setShowAiPrompt(true)}
            >
              <div className="icon-gradient w-14 h-14 mb-4 shadow-glow">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-gradient text-base mb-1">AI Generate</h3>
              <p className="text-sm text-gray-600">Smart creation</p>
            </div>
            
            <div 
              className="create-card p-6 rounded-2xl cursor-pointer"
              onClick={() => handleCreateDiagram('custom')}
            >
              <div className="icon-gradient w-14 h-14 mb-4">
                <Plus className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 text-base mb-1">Custom</h3>
              <p className="text-sm text-gray-600">Your design</p>
            </div>
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