import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Brain, Zap, Users, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Architects Suite
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI-powered architecture diagram generator that transforms your ideas into professional diagrams instantly
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Brain className="h-5 w-5 mr-2" />
                Get Started
              </Button>
            </Link>
            <Link href="/diagrams/create?type=cloud-architecture">
              <Button variant="outline" size="lg">
                <Zap className="h-5 w-5 mr-2" />
                Try AI Generator
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <Brain className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
            <p className="text-gray-600">Generate architecture diagrams from natural language descriptions</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <Users className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Collaborative</h3>
            <p className="text-gray-600">Work together with your team in real-time</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <Shield className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Enterprise Ready</h3>
            <p className="text-gray-600">Secure, scalable, and compliant with industry standards</p>
          </div>
        </div>
      </div>
    </div>
  );
}