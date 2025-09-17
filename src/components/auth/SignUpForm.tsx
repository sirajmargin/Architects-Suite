'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Mail, Lock, User, Building } from 'lucide-react';
import { AuthService } from '@/services/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  company?: string;
  useCase?: string;
}

interface AIRecommendation {
  type: 'success' | 'info' | 'warning';
  title: string;
  description: string;
  action?: string;
}

export function SignUpForm() {
  const [formData, setFormData] = useState<SignUpFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    useCase: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const router = useRouter();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = async (field: keyof SignUpFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear specific field error
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // AI-powered real-time recommendations
    if (field === 'email' && value.includes('@')) {
      await analyzeEmailDomain(value);
    }
    
    if (field === 'useCase' && value.length > 10) {
      await analyzeUseCase(value);
    }
  };

  const analyzeEmailDomain = async (email: string) => {
    try {
      setIsAnalyzing(true);
      const domain = email.split('@')[1];
      
      // Call AI service to analyze email domain and suggest optimizations
      const response = await fetch('/api/ai/analyze-email-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, domain })
      });
      
      const analysis = await response.json();
      
      if (analysis.recommendations) {
        setAiRecommendations(prev => [
          ...prev.filter(r => r.type !== 'info'),
          {
            type: 'info',
            title: 'Smart Setup Detected',
            description: analysis.recommendations[0] || 'We can help optimize your workspace setup.',
            action: 'Learn More'
          }
        ]);
      }
    } catch (error) {
      console.error('Email analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeUseCase = async (useCase: string) => {
    try {
      const response = await fetch('/api/ai/analyze-use-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useCase })
      });
      
      const analysis = await response.json();
      
      if (analysis.templateSuggestions) {
        setAiRecommendations(prev => [
          ...prev.filter(r => r.type !== 'success'),
          {
            type: 'success',
            title: 'Perfect Match Found!',
            description: `We have ${analysis.templateSuggestions.length} templates that match your use case.`,
            action: 'Preview Templates'
          }
        ]);
      }
    } catch (error) {
      console.error('Use case analysis failed:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use AI-enhanced signup service
      const result = await AuthService.handleAISignUp({
        email: formData.email,
        name: formData.name,
        company: formData.company,
        useCase: formData.useCase
      });
      
      if (result.success) {
        // Show AI recommendations
        if (result.recommendations.length > 0) {
          setAiRecommendations([
            {
              type: 'success',
              title: 'Welcome to Architects Suite!',
              description: 'Based on your profile, we\\'ve prepared a personalized onboarding experience.',
              action: 'Start Journey'
            }
          ]);
        }
        
        // Redirect to onboarding with AI recommendations
        setTimeout(() => {
          router.push(`/onboarding?flow=${result.onboardingFlow}&recommendations=${result.recommendations.join(',')}`);
        }, 2000);
      } else {
        setErrors({ general: result.error || 'Sign up failed. Please try again.' });
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider: 'google' | 'github' | 'microsoft') => {
    setIsLoading(true);
    
    try {
      // Redirect to OAuth provider with AI enhancement flag
      window.location.href = `/api/auth/oauth/${provider}?signup=true&ai_enhanced=true`;
    } catch (error) {
      console.error('OAuth sign up error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className=\"flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12\">
      <Card className=\"w-full max-w-lg\">
        <CardHeader className=\"space-y-1\">
          <CardTitle className=\"text-2xl font-bold text-center\">
            Join Architects Suite
          </CardTitle>
          <CardDescription className=\"text-center\">
            Create diagrams with AI-powered intelligence
          </CardDescription>
        </CardHeader>
        
        <CardContent className=\"space-y-4\">
          {/* AI Recommendations */}
          {aiRecommendations.map((rec, index) => (
            <Alert key={index} className={`border-l-4 ${
              rec.type === 'success' ? 'border-green-500 bg-green-50' :
              rec.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              <AlertDescription>
                <div className=\"flex items-center justify-between\">
                  <div>
                    <p className=\"font-medium\">{rec.title}</p>
                    <p className=\"text-sm text-gray-600\">{rec.description}</p>
                  </div>
                  {rec.action && (
                    <Button variant=\"outline\" size=\"sm\">
                      {rec.action}
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          ))}
          
          {/* OAuth Buttons */}
          <div className=\"grid grid-cols-3 gap-3\">
            <Button 
              variant=\"outline\" 
              onClick={() => handleOAuthSignUp('google')}
              disabled={isLoading}
            >
              <svg className=\"w-4 h-4 mr-2\" viewBox=\"0 0 24 24\">
                <path fill=\"#4285f4\" d=\"M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z\"/>
                <path fill=\"#34a853\" d=\"M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z\"/>
                <path fill=\"#fbbc05\" d=\"M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z\"/>
                <path fill=\"#ea4335\" d=\"M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z\"/>
              </svg>
              Google
            </Button>
            
            <Button 
              variant=\"outline\" 
              onClick={() => handleOAuthSignUp('github')}
              disabled={isLoading}
            >
              <svg className=\"w-4 h-4 mr-2\" fill=\"currentColor\" viewBox=\"0 0 24 24\">
                <path d=\"M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z\"/>
              </svg>
              GitHub
            </Button>
            
            <Button 
              variant=\"outline\" 
              onClick={() => handleOAuthSignUp('microsoft')}
              disabled={isLoading}
            >
              <svg className=\"w-4 h-4 mr-2\" viewBox=\"0 0 24 24\">
                <path fill=\"#f25022\" d=\"M1 1h10v10H1z\"/>
                <path fill=\"#00a4ef\" d=\"M13 1h10v10H13z\"/>
                <path fill=\"#7fba00\" d=\"M1 13h10v10H1z\"/>
                <path fill=\"#ffb900\" d=\"M13 13h10v10H13z\"/>
              </svg>
              Microsoft
            </Button>
          </div>
          
          <div className=\"relative\">
            <div className=\"absolute inset-0 flex items-center\">
              <span className=\"w-full border-t\" />
            </div>
            <div className=\"relative flex justify-center text-xs uppercase\">
              <span className=\"bg-background px-2 text-muted-foreground\">
                Or continue with email
              </span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className=\"space-y-4\">
            {errors.general && (
              <Alert className=\"border-red-500 bg-red-50\">
                <AlertDescription className=\"text-red-700\">
                  {errors.general}
                </AlertDescription>
              </Alert>
            )}
            
            <div className=\"grid grid-cols-1 gap-4\">
              <div className=\"space-y-2\">
                <Label htmlFor=\"name\">Full Name</Label>
                <div className=\"relative\">
                  <User className=\"absolute left-3 top-3 h-4 w-4 text-gray-400\" />
                  <Input
                    id=\"name\"
                    type=\"text\"
                    placeholder=\"Enter your full name\"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.name && <p className=\"text-sm text-red-600\">{errors.name}</p>}
              </div>
              
              <div className=\"space-y-2\">
                <Label htmlFor=\"email\">Email Address</Label>
                <div className=\"relative\">
                  <Mail className=\"absolute left-3 top-3 h-4 w-4 text-gray-400\" />
                  {isAnalyzing && (
                    <Loader2 className=\"absolute right-3 top-3 h-4 w-4 animate-spin text-blue-500\" />
                  )}
                  <Input
                    id=\"email\"
                    type=\"email\"
                    placeholder=\"Enter your email address\"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.email && <p className=\"text-sm text-red-600\">{errors.email}</p>}
              </div>
              
              <div className=\"space-y-2\">
                <Label htmlFor=\"company\">Company (Optional)</Label>
                <div className=\"relative\">
                  <Building className=\"absolute left-3 top-3 h-4 w-4 text-gray-400\" />
                  <Input
                    id=\"company\"
                    type=\"text\"
                    placeholder=\"Enter your company name\"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className=\"pl-10\"
                  />
                </div>
              </div>
              
              <div className=\"space-y-2\">
                <Label htmlFor=\"useCase\">What will you use Architects Suite for?</Label>
                <Input
                  id=\"useCase\"
                  type=\"text\"
                  placeholder=\"e.g., Software architecture diagrams, Cloud infrastructure...\"
                  value={formData.useCase}
                  onChange={(e) => handleInputChange('useCase', e.target.value)}
                />
              </div>
              
              <div className=\"space-y-2\">
                <Label htmlFor=\"password\">Password</Label>
                <div className=\"relative\">
                  <Lock className=\"absolute left-3 top-3 h-4 w-4 text-gray-400\" />
                  <Input
                    id=\"password\"
                    type={showPassword ? 'text' : 'password'}
                    placeholder=\"Create a strong password\"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type=\"button\"
                    onClick={() => setShowPassword(!showPassword)}
                    className=\"absolute right-3 top-3 text-gray-400 hover:text-gray-600\"
                  >
                    {showPassword ? <EyeOff className=\"h-4 w-4\" /> : <Eye className=\"h-4 w-4\" />}
                  </button>
                </div>
                {errors.password && <p className=\"text-sm text-red-600\">{errors.password}</p>}
              </div>
              
              <div className=\"space-y-2\">
                <Label htmlFor=\"confirmPassword\">Confirm Password</Label>
                <div className=\"relative\">
                  <Lock className=\"absolute left-3 top-3 h-4 w-4 text-gray-400\" />
                  <Input
                    id=\"confirmPassword\"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder=\"Confirm your password\"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  <button
                    type=\"button\"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className=\"absolute right-3 top-3 text-gray-400 hover:text-gray-600\"
                  >
                    {showConfirmPassword ? <EyeOff className=\"h-4 w-4\" /> : <Eye className=\"h-4 w-4\" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className=\"text-sm text-red-600\">{errors.confirmPassword}</p>}
              </div>
            </div>
            
            <Button 
              type=\"submit\" 
              className=\"w-full\" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className=\"mr-2 h-4 w-4 animate-spin\" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
            
            <p className=\"text-center text-sm text-gray-600\">
              Already have an account?{' '}
              <Link href=\"/auth/signin\" className=\"font-medium text-blue-600 hover:text-blue-500\">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}