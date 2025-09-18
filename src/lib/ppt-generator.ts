export interface PPTTemplate {
  id: string;
  name: string;
  slides: {
    title: string;
    layout: 'title' | 'content' | 'diagram' | 'summary';
    content?: string[];
  }[];
}

export class PPTGenerator {
  static generateArchitecturePPT(services: any[], prompt: string, template?: PPTTemplate): any {
    const defaultTemplate: PPTTemplate = {
      id: 'default',
      name: 'Architecture Overview',
      slides: [
        {
          title: 'Architecture Overview',
          layout: 'title'
        },
        {
          title: 'System Components',
          layout: 'content'
        },
        {
          title: 'Architecture Diagram',
          layout: 'diagram'
        },
        {
          title: 'Summary & Next Steps',
          layout: 'summary'
        }
      ]
    };

    const selectedTemplate = template || defaultTemplate;
    const components = this.analyzeComponents(services);
    
    return {
      title: selectedTemplate.name,
      slides: selectedTemplate.slides.map(slide => {
        switch (slide.layout) {
          case 'title':
            return {
              ...slide,
              content: [
                `Generated from: "${prompt}"`,
                `Components: ${components.length}`,
                `Architecture Type: ${this.detectArchitectureType(services)}`
              ]
            };
          
          case 'content':
            return {
              ...slide,
              content: components.map(comp => 
                `• ${comp.name} (${comp.type}): ${comp.description}`
              )
            };
          
          case 'diagram':
            return {
              ...slide,
              content: ['[Architecture Diagram Placeholder]'],
              diagramData: services
            };
          
          case 'summary':
            return {
              ...slide,
              content: [
                `✓ ${components.length} components identified`,
                `✓ ${this.countConnections(services)} connections mapped`,
                `• Consider security implementation`,
                `• Plan monitoring and logging`,
                `• Define deployment strategy`
              ]
            };
          
          default:
            return slide;
        }
      })
    };
  }

  private static analyzeComponents(services: any[]) {
    return services.map(service => ({
      name: service.name,
      type: service.type,
      description: this.getComponentDescription(service)
    }));
  }

  private static getComponentDescription(service: any): string {
    const descriptions: Record<string, string> = {
      'compute': 'Processing and business logic',
      'database': 'Data storage and persistence',
      'network': 'Traffic routing and load balancing',
      'storage': 'File and object storage',
      'security': 'Authentication and authorization'
    };
    return descriptions[service.type] || 'System component';
  }

  private static detectArchitectureType(services: any[]): string {
    const hasGateway = services.some(s => s.name.toLowerCase().includes('gateway'));
    const hasMultipleServices = services.filter(s => s.type === 'compute').length > 2;
    const hasLambda = services.some(s => s.name.toLowerCase().includes('lambda'));
    
    if (hasLambda) return 'Serverless';
    if (hasGateway && hasMultipleServices) return 'Microservices';
    return 'Monolithic/Traditional';
  }

  private static countConnections(services: any[]): number {
    return services.reduce((total, service) => 
      total + (service.connections?.length || 0), 0
    );
  }
}