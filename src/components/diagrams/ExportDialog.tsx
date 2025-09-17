'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Settings, FileText, Image, File } from 'lucide-react';
import { ExportFormat, ExportOptions, DiagramType } from '@/types';
import { exportService } from '@/services/exportService';
import { useToast } from '@/hooks/use-toast';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  diagramElement: HTMLElement | null;
  diagramCode: string;
  diagramType: DiagramType;
  title?: string;
}

export function ExportDialog({
  isOpen,
  onClose,
  diagramElement,
  diagramCode,
  diagramType,
  title = 'Untitled Diagram'
}: ExportDialogProps) {
  const { toast } = useToast();
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
  const [isExporting, setIsExporting] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    filename: title.toLowerCase().replace(/\s+/g, '-'),
    title,
    diagramType,
    scale: 2,
    quality: 0.9,
    backgroundColor: '#ffffff',
    orientation: 'landscape',
    pageSize: 'a4',
    includeMetadata: true
  });

  const formatIcons = {
    png: Image,
    svg: Image,
    pdf: FileText,
    markdown: FileText,
    json: File
  };

  const formatDescriptions = {
    png: 'Raster image format, best for sharing and embedding',
    svg: 'Vector format, scalable and editable',
    pdf: 'Document format, perfect for reports and presentations',
    markdown: 'Text format with embedded diagram code',
    json: 'Data format for importing into other tools'
  };

  const handleExport = async () => {
    if (!diagramElement) {
      toast({
        title: 'Export Failed',
        description: 'No diagram element found to export',
        variant: 'destructive'
      });
      return;
    }

    setIsExporting(true);

    try {
      const validation = exportService.validateExportOptions(options);
      if (!validation.valid) {
        toast({
          title: 'Invalid Options',
          description: validation.errors.join(', '),
          variant: 'destructive'
        });
        return;
      }

      const result = await exportService.exportDiagram(
        diagramElement,
        diagramCode,
        exportFormat,
        options
      );

      if (result.success && result.data) {
        exportService.downloadFile(result.data as Blob, result.filename!);
        toast({
          title: 'Export Successful',
          description: `Diagram exported as ${result.filename}`
        });
        onClose();
      } else {
        toast({
          title: 'Export Failed',
          description: result.error || 'Unknown error occurred',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const updateOptions = (updates: Partial<ExportOptions>) => {
    setOptions(prev => ({ ...prev, ...updates }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Diagram
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="format" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="format">Format & Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
          </TabsList>

          <TabsContent value="format" className="space-y-4">
            {/* Format Selection */}
            <div className="space-y-2">
              <Label>Export Format</Label>
              <div className="grid grid-cols-1 gap-2">
                {(Object.keys(formatDescriptions) as ExportFormat[]).map((format) => {
                  const Icon = formatIcons[format];
                  return (
                    <div
                      key={format}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        exportFormat === format
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setExportFormat(format)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <div>
                          <div className="font-medium">{format.toUpperCase()}</div>
                          <div className="text-sm text-gray-600">
                            {formatDescriptions[format]}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Basic Options */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filename">Filename</Label>
                <Input
                  id="filename"
                  value={options.filename || ''}
                  onChange={(e) => updateOptions({ filename: e.target.value })}
                  placeholder="diagram"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={options.title || ''}
                  onChange={(e) => updateOptions({ title: e.target.value })}
                  placeholder="Diagram Title"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={options.description || ''}
                onChange={(e) => updateOptions({ description: e.target.value })}
                placeholder="Brief description of the diagram..."
                rows={2}
              />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            {/* Quality and Scale */}
            {(exportFormat === 'png' || exportFormat === 'pdf') && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Scale: {options.scale}x</Label>
                  <Slider
                    value={[options.scale || 2]}
                    onValueChange={([value]) => updateOptions({ scale: value })}
                    min={0.5}
                    max={4}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-600">
                    Higher scale = better quality but larger file size
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Quality: {Math.round((options.quality || 0.9) * 100)}%</Label>
                  <Slider
                    value={[options.quality || 0.9]}
                    onValueChange={([value]) => updateOptions({ quality: value })}
                    min={0.1}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Background Color */}
            {(exportFormat === 'png' || exportFormat === 'pdf') && (
              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={options.backgroundColor || '#ffffff'}
                    onChange={(e) => updateOptions({ backgroundColor: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    value={options.backgroundColor || '#ffffff'}
                    onChange={(e) => updateOptions({ backgroundColor: e.target.value })}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>
            )}

            {/* PDF Options */}
            {exportFormat === 'pdf' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Orientation</Label>
                  <Select
                    value={options.orientation || 'landscape'}
                    onValueChange={(value: 'portrait' | 'landscape') =>
                      updateOptions({ orientation: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="landscape">Landscape</SelectItem>
                      <SelectItem value="portrait">Portrait</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Page Size</Label>
                  <Select
                    value={options.pageSize || 'a4'}
                    onValueChange={(value) => updateOptions({ pageSize: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a4">A4</SelectItem>
                      <SelectItem value="a3">A3</SelectItem>
                      <SelectItem value="letter">Letter</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Custom Dimensions */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Custom Width (px)</Label>
                <Input
                  id="width"
                  type="number"
                  value={options.width || ''}
                  onChange={(e) =>
                    updateOptions({ width: e.target.value ? parseInt(e.target.value) : undefined })
                  }
                  placeholder="Auto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Custom Height (px)</Label>
                <Input
                  id="height"
                  type="number"
                  value={options.height || ''}
                  onChange={(e) =>
                    updateOptions({ height: e.target.value ? parseInt(e.target.value) : undefined })
                  }
                  placeholder="Auto"
                />
              </div>
            </div>

            {/* Metadata Options */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeMetadata"
                  checked={options.includeMetadata || false}
                  onCheckedChange={(checked) =>
                    updateOptions({ includeMetadata: checked as boolean })
                  }
                />
                <Label htmlFor="includeMetadata">Include metadata in export</Label>
              </div>
              <div className="text-sm text-gray-600">
                Adds creation date, diagram type, and other metadata to the exported file
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={options.notes || ''}
                onChange={(e) => updateOptions({ notes: e.target.value })}
                placeholder="Any additional notes or documentation..."
                rows={3}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export {exportFormat.toUpperCase()}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}