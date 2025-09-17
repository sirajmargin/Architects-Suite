'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Editor } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Download, 
  Share2, 
  Save, 
  Undo, 
  Redo, 
  Settings,
  Eye,
  Code,
  Split,
  Zap,
  FileText,
  HelpCircle
} from 'lucide-react';
import { DiagramType } from '@/types';
import { debounce } from '@/lib/utils';

interface DiagramAsCodeEditorProps {
  diagramId?: string;
  initialContent?: string;
  diagramType: DiagramType;
  onSave?: (content: string) => void;
  onPreview?: (content: string) => void;
}

export function DiagramAsCodeEditor({
  diagramId,
  initialContent = '',
  diagramType,
  onSave,
  onPreview
}: DiagramAsCodeEditorProps) {
  const [code, setCode] = useState(initialContent);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [syntaxErrors, setSyntaxErrors] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Language configuration for different diagram types
  const getLanguageConfig = (type: DiagramType) => {
    switch (type) {
      case 'flowchart':
        return {
          language: 'yaml',
          syntax: 'mermaid',
          placeholder: `flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process 1]
    B -->|No| D[Process 2]
    C --> E[End]
    D --> E`,
          theme: 'vs-dark'
        };
      case 'sequence':
        return {
          language: 'yaml',
          syntax: 'mermaid',
          placeholder: `sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello Bob, how are you?
    B-->>A: Great!`,
          theme: 'vs-dark'
        };
      case 'erd':
        return {
          language: 'yaml',
          syntax: 'mermaid',
          placeholder: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER {
        string name
        string email
    }`,
          theme: 'vs-dark'
        };
      default:
        return {
          language: 'yaml',
          syntax: 'mermaid',
          placeholder: 'Start typing your diagram code...',
          theme: 'vs-dark'
        };
    }
  };

  const config = getLanguageConfig(diagramType);

  // Debounced AI analysis
  const analyzeCode = useCallback(
    debounce(async (codeContent: string) => {
      if (!codeContent.trim()) return;
      
      setIsAnalyzing(true);
      
      try {
        // AI-powered syntax analysis and suggestions
        const response = await fetch('/api/ai/analyze-diagram-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: codeContent,
            diagramType,
            syntax: config.syntax
          })
        });
        
        const analysis = await response.json();
        
        if (analysis.success) {
          setSyntaxErrors(analysis.errors || []);
          setAiSuggestions(analysis.suggestions || []);
        }
      } catch (error) {
        console.error('Code analysis failed:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }, 1000),
    [diagramType, config.syntax]
  );

  useEffect(() => {
    if (code) {
      analyzeCode(code);
    }
  }, [code, analyzeCode]);

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    
    // Real-time preview update
    if (onPreview) {
      onPreview(newCode);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      if (onSave) {
        await onSave(code);
      }
      
      // Also save to backend
      await fetch('/api/diagrams/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: diagramId,
          content: code,
          type: diagramType
        })
      });
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAIEnhance = async () => {
    try {
      const response = await fetch('/api/ai/enhance-diagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          diagramType,
          enhancementType: 'improve'
        })
      });
      
      const result = await response.json();
      
      if (result.success && result.enhancedCode) {
        setCode(result.enhancedCode);
      }
    } catch (error) {
      console.error('AI enhancement failed:', error);
    }
  };

  const handleExport = async (format: 'png' | 'svg' | 'pdf' | 'markdown') => {
    try {
      const response = await fetch('/api/diagrams/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          diagramType,
          format
        })
      });
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diagram.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const insertTemplate = (templateCode: string) => {
    setCode(templateCode);
  };

  const applySuggestion = (suggestion: any) => {
    if (suggestion.type === 'replace') {
      setCode(suggestion.newCode);
    } else if (suggestion.type === 'insert') {
      setCode(code + '\n' + suggestion.code);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-2">
          <Button
            variant={isPreviewMode ? 'outline' : 'default'}
            size="sm"
            onClick={() => setIsPreviewMode(false)}
          >
            <Code className="h-4 w-4 mr-1" />
            Code
          </Button>
          
          <Button
            variant={isPreviewMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsPreviewMode(true)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          
          <Button variant="outline" size="sm">
            <Split className="h-4 w-4 mr-1" />
            Split
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleAIEnhance}>
            <Zap className="h-4 w-4 mr-1" />
            AI Enhance
          </Button>
          
          <Button variant="outline" size="sm">
            <Undo className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="sm">
            <Redo className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-1" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
          
          <div className="relative">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            {/* Export dropdown would go here */}
          </div>
          
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with templates and suggestions */}
        <div className="w-80 border-r bg-gray-50 overflow-y-auto">
          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <Card className="m-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  AI Suggestions
                  {isAnalyzing && <div className="ml-2 w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {aiSuggestions.slice(0, 3).map((suggestion, index) => (
                  <Alert key={index} className="p-3">
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{suggestion.title}</p>
                          <p className="text-xs text-gray-600">{suggestion.description}</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => applySuggestion(suggestion)}
                        >
                          Apply
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Syntax Errors */}
          {syntaxErrors.length > 0 && (
            <Card className="m-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-red-600">
                  Syntax Issues
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {syntaxErrors.map((error, index) => (
                  <Alert key={index} className="border-red-200 bg-red-50 p-3">
                    <AlertDescription>
                      <p className="text-sm text-red-800">
                        Line {error.line}: {error.message}
                      </p>
                    </AlertDescription>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Templates */}
          <Card className="m-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                <FileText className="h-4 w-4 mr-2 inline" />
                Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => insertTemplate(config.placeholder)}
              >
                Basic {diagramType}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => insertTemplate('// Advanced template coming soon...')}
              >
                Advanced Template
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => insertTemplate('// Custom template...')}
              >
                Custom Template
              </Button>
            </CardContent>
          </Card>

          {/* Help */}
          <Card className="m-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                <HelpCircle className="h-4 w-4 mr-2 inline" />
                Syntax Help
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div>
                <p className="font-medium">Basic Syntax:</p>
                <p className="text-gray-600">Use {config.syntax} syntax for {diagramType}</p>
              </div>
              <div>
                <p className="font-medium">Shortcuts:</p>
                <p className="text-gray-600">Ctrl+S: Save</p>
                <p className="text-gray-600">Ctrl+Z: Undo</p>
                <p className="text-gray-600">Ctrl+/: Comment</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          {!isPreviewMode ? (
            <Editor
              height="100%"
              language={config.language}
              theme={config.theme}
              value={code}
              onChange={handleCodeChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                wordWrap: 'on',
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                rulers: [80],
                bracketPairColorization: { enabled: true },
                suggest: {
                  showKeywords: true,
                  showSnippets: true,
                },
                quickSuggestions: true,
                folding: true,
                foldingHighlight: true,
                showFoldingControls: 'always',
              }}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Preview mode</p>
                <p className="text-sm text-gray-500">Diagram preview will be rendered here</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t bg-gray-50 text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span>Type: {diagramType}</span>
          <span>Syntax: {config.syntax}</span>
          <span>Lines: {code.split('\n').length}</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {syntaxErrors.length > 0 && (
            <span className="text-red-600">
              {syntaxErrors.length} error{syntaxErrors.length > 1 ? 's' : ''}
            </span>
          )}
          
          {isAnalyzing && (
            <span className="text-blue-600">Analyzing...</span>
          )}
          
          <span>Ready</span>
        </div>
      </div>
    </div>
  );
}