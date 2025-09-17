import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Brain, 
  GitBranch, 
  Users, 
  Zap, 
  Shield, 
  Globe, 
  Clock,
  Star,
  CheckCircle
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Architects Suite</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            AI-Powered Collaborative
            <span className="text-blue-600"> Diagramming</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create stunning diagrams with AI assistance, collaborate in real-time, 
            and integrate with your favorite tools. Perfect for architects, developers, 
            and technical teams.
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <Link href="/auth/signup">
              <Button size="lg" className="px-8 py-3">
                <Brain className="mr-2 h-5 w-5" />
                Start Creating with AI
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="px-8 py-3">
                Watch Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Technical Documentation
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed for modern development teams
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <Brain className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>AI-Generated Diagrams</CardTitle>
                <CardDescription>
                  Generate architecture, ER, sequence, and UML diagrams from code, 
                  plain English, or existing documentation.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-none shadow-lg">
              <CardHeader>
                <GitBranch className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Diagram-as-Code</CardTitle>
                <CardDescription>
                  Use simple syntax to create consistent diagrams that version 
                  control alongside your code.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-none shadow-lg">
              <CardHeader>
                <Users className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Real-Time Collaboration</CardTitle>
                <CardDescription>
                  Multiple users can edit, comment, and iterate on diagrams 
                  simultaneously with live cursors and changes.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-none shadow-lg">
              <CardHeader>
                <Zap className="h-12 w-12 text-yellow-600 mb-4" />
                <CardTitle>CI/CD Integration</CardTitle>
                <CardDescription>
                  Automatically update diagrams on pull requests with our 
                  "Eraserbot"-style agent for always-current documentation.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-none shadow-lg">
              <CardHeader>
                <Globe className="h-12 w-12 text-indigo-600 mb-4" />
                <CardTitle>Platform Integrations</CardTitle>
                <CardDescription>
                  Connect with GitHub, Notion, Confluence, and more. 
                  Export to PNG, SVG, PDF, and Markdown.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-none shadow-lg">
              <CardHeader>
                <Shield className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>Enterprise Security</CardTitle>
                <CardDescription>
                  SOC 2 Type 2 compliant with SAML SSO, private cloud 
                  deployment, and comprehensive audit trails.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Diagram Types Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Support for All Diagram Types
            </h2>
            <p className="text-xl text-gray-600">
              From simple flowcharts to complex cloud architectures
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              'Flowcharts',
              'Sequence Diagrams',
              'ERDs',
              'UML Diagrams',
              'Cloud Architecture',
              'Component Diagrams',
              'Network Diagrams',
              'Mind Maps'
            ].map((type) => (
              <Card key={type} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <GitBranch className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{type}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Documentation?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of teams already using AI-powered diagramming
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <Link href="/auth/signup">
              <Button size="lg" variant="outline" className="px-8 py-3 bg-white text-blue-600 hover:bg-gray-50">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="px-8 py-3 border-white text-white hover:bg-blue-700">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Architects Suite</h3>
              <p className="text-gray-400">
                AI-powered collaborative diagramming for modern development teams.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/integrations" className="hover:text-white">Integrations</Link></li>
                <li><Link href="/security" className="hover:text-white">Security</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
                <li><Link href="/api" className="hover:text-white">API</Link></li>
                <li><Link href="/templates" className="hover:text-white">Templates</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Architects Suite. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}