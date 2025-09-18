import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Download, Upload } from 'lucide-react';

interface PPTViewerProps {
  pptData: any;
  onTemplateUpload?: (template: any) => void;
}

export function PPTViewer({ pptData, onTemplateUpload }: PPTViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showTemplateUpload, setShowTemplateUpload] = useState(false);

  const nextSlide = () => {
    setCurrentSlide(prev => Math.min(prev + 1, pptData.slides.length - 1));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  };

  const downloadPPT = () => {
    const pptContent = JSON.stringify(pptData, null, 2);
    const blob = new Blob([pptContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'architecture-presentation.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTemplateUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const template = JSON.parse(e.target?.result as string);
          onTemplateUpload?.(template);
          setShowTemplateUpload(false);
        } catch (error) {
          alert('Invalid template file');
        }
      };
      reader.readAsText(file);
    }
  };

  const slide = pptData.slides[currentSlide];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">{pptData.title}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowTemplateUpload(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Template
          </Button>
          <Button variant="outline" size="sm" onClick={downloadPPT}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Template Upload */}
      {showTemplateUpload && (
        <div className="p-4 bg-blue-50 border-b">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Upload PPT Template:</label>
            <input
              type="file"
              accept=".json"
              onChange={handleTemplateUpload}
              className="text-sm"
            />
            <Button variant="outline" size="sm" onClick={() => setShowTemplateUpload(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Slide Content */}
      <div className="flex-1 p-8">
        <Card className="w-full h-full">
          <CardHeader>
            <CardTitle className="text-2xl text-center">{slide.title}</CardTitle>
          </CardHeader>
          <CardContent className="h-full">
            {slide.layout === 'diagram' ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏗️</div>
                  <p className="text-gray-600">Architecture Diagram</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {slide.diagramData?.length || 0} components
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {slide.content?.map((item: string, index: number) => (
                  <div key={index} className="text-lg leading-relaxed">
                    {item}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-4 border-t">
        <Button
          variant="outline"
          onClick={prevSlide}
          disabled={currentSlide === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <span className="text-sm text-gray-600">
          {currentSlide + 1} of {pptData.slides.length}
        </span>
        
        <Button
          variant="outline"
          onClick={nextSlide}
          disabled={currentSlide === pptData.slides.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}