import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import { ExportDialog } from '@/components/diagrams/ExportDialog';
import { exportService } from '@/services/exportService';

// Mock the export service
jest.mock('@/services/exportService', () => ({
  exportService: {
    exportDiagram: jest.fn(),
    validateExportOptions: jest.fn(),
    downloadFile: jest.fn(),
    getSupportedFormats: jest.fn()
  }
}));

// Mock HTML2Canvas
jest.mock('html2canvas', () => ({
  default: jest.fn(() => Promise.resolve({
    toBlob: jest.fn((callback) => callback(new Blob(['fake-image'], { type: 'image/png' })))
  }))
}));

describe('ExportDialog', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    diagramElement: document.createElement('div'),
    diagramCode: 'graph TD\n  A --> B',
    diagramType: 'flowchart' as const,
    title: 'Test Diagram'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (exportService.validateExportOptions as jest.Mock).mockReturnValue({
      valid: true,
      errors: []
    });
  });

  it('renders export dialog with format options', () => {
    render(<ExportDialog {...mockProps} />);
    
    expect(screen.getByText('Export Diagram')).toBeInTheDocument();
    expect(screen.getByText('PNG')).toBeInTheDocument();
    expect(screen.getByText('SVG')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('MARKDOWN')).toBeInTheDocument();
    expect(screen.getByText('JSON')).toBeInTheDocument();
  });

  it('handles successful export', async () => {
    (exportService.exportDiagram as jest.Mock).mockResolvedValue({
      success: true,
      data: new Blob(['test'], { type: 'image/png' }),
      filename: 'test-diagram.png'
    });

    render(<ExportDialog {...mockProps} />);
    
    const exportButton = screen.getByText(/Export PNG/);
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(exportService.exportDiagram).toHaveBeenCalledWith(
        mockProps.diagramElement,
        mockProps.diagramCode,
        'png',
        expect.any(Object)
      );
    });
  });

  it('handles export validation errors', async () => {
    (exportService.validateExportOptions as jest.Mock).mockReturnValue({
      valid: false,
      errors: ['Invalid scale value']
    });

    render(<ExportDialog {...mockProps} />);
    
    const exportButton = screen.getByText(/Export PNG/);
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(exportService.exportDiagram).not.toHaveBeenCalled();
    });
  });

  it('updates export options correctly', () => {
    render(<ExportDialog {...mockProps} />);
    
    // Switch to advanced tab
    fireEvent.click(screen.getByText('Advanced Options'));
    
    // Update scale
    const scaleSlider = screen.getByLabelText(/Scale:/);
    fireEvent.change(scaleSlider, { target: { value: '3' } });
    
    // Update background color
    const colorInput = screen.getByLabelText('Background Color');
    fireEvent.change(colorInput, { target: { value: '#ff0000' } });
    
    expect(scaleSlider).toBeInTheDocument();
    expect(colorInput).toBeInTheDocument();
  });
});