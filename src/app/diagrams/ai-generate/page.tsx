'use client';

import { useState } from 'react';
import { Brain, ArrowRight, Download, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AIGeneratePage() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [diagramXML, setDiagramXML] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError('');
    
    try {
      // Call AI service
      const aiResponse = await fetch('http://localhost:3001/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      const aiResult = await aiResponse.json();
      
      if (aiResult.success) {
        // Convert to draw.io XML
        const diagramResponse = await fetch('http://localhost:3002/convert-drawio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ services: aiResult.content.visual.services })
        });
        
        const diagramResult = await diagramResponse.json();
        
        if (diagramResult.success) {
          setDiagramXML(diagramResult.xml);
        } else {
          setError('Failed to convert to draw.io format');
        }
      } else {
        setError('Failed to generate diagram');
      }
    } catch (err) {
      setError('Service unavailable. Please ensure all services are running.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadDrawIO = () => {
    const blob = new Blob([diagramXML], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'architecture.drawio';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="professional-header mx-4 mt-4 rounded-2xl sticky top-4 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-18">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="icon-gradient w-12 h-12">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">AI Generator</h1>
                <p className="text-sm text-gray-600 font-medium">Architecture from Description</p>
              </div>
            </div>
            <Link href="/dashboard" className="glass-card px-4 py-2 rounded-lg flex items-center space-x-2 hover:shadow-lg transition-all">
              <Home className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Home</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Input Section */}
        <div className="ai-prompt-card mb-8 p-8 rounded-3xl animate-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <div className="icon-gradient w-16 h-16 shadow-glow">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-bold gradient-text">AI Architecture Generator</h3>
              <p className="text-lg text-gray-700 font-medium">Describe your architecture and watch AI create it instantly</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">Describe your architecture:</label>
              <textarea
                className="w-full min-h-[120px] resize-none border-2 border-gray-200 focus:border-blue-400 rounded-xl p-4 text-base"
                placeholder="✨ Examples:\n• Create a simple VPC Peering diagram for AWS Cloud with AWS Icons\n• Design a microservices e-commerce platform with user auth, product catalog, and payment processing\n• Build a serverless architecture with API Gateway, Lambda, and DynamoDB"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <button 
                  onClick={handleGenerate} 
                  disabled={!prompt.trim() || isGenerating}
                  className="btn-primary px-6 py-3 text-base shadow-glow rounded-xl font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating Magic...
                    </>
                  ) : (
                    <>
                      <Brain className="h-5 w-5 mr-3" />
                      Generate Architecture
                      <ArrowRight className="h-5 w-5 ml-3" />
                    </>
                  )}
                </button>
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

        {/* Error Display */}
        {error && (
          <div className="glass-card border-red-200 bg-red-50/80 rounded-2xl p-6 mb-8 animate-fade-in">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {diagramXML && (
          <div className="glass-card rounded-3xl p-8 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="icon-gradient w-12 h-12">
                  <Download className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold gradient-text">Generated Architecture</h2>
                  <p className="text-gray-600">Your diagram is ready for download and editing</p>
                </div>
              </div>
              <button
                onClick={downloadDrawIO}
                className="btn-primary px-6 py-3 rounded-xl hover:shadow-glow flex items-center font-semibold"
              >
                <Download className="h-5 w-5 mr-2" />
                Download .drawio
              </button>
            </div>
            
            {/* Draw.io Viewer */}
            <div className="border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg" style={{ height: '600px' }}>
              <iframe
                src={`https://viewer.diagrams.net/?embed=1&ui=min&spin=1&proto=json&xml=${encodeURIComponent(diagramXML)}`}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                title="Architecture Diagram"
              />
            </div>
            
            {/* XML Preview */}
            <details className="mt-6">
              <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900 p-3 bg-gray-50 rounded-lg">
                🔍 View XML Source Code
              </summary>
              <pre className="mt-3 p-4 bg-gray-900 text-green-400 rounded-xl text-xs overflow-auto max-h-60 font-mono">
                {diagramXML}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}