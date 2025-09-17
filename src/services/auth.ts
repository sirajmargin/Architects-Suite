import { prisma } from '@/lib/prisma';
import { User } from '@/types';

export class AuthService {
  // External AI-powered authentication analysis
  static async analyzeUserBehavior(userProfile: any): Promise<{
    riskScore: number;
    recommendations: string[];
    onboardingFlow: string;
  }> {
    try {
      // Integrate with external AI service (OpenAI, Anthropic, etc.)
      const response = await fetch(`${process.env.AI_SERVICE_URL}/analyze-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.AI_SERVICE_API_KEY}`,
        },
        body: JSON.stringify({
          email: userProfile.email,
          name: userProfile.name,
          domain: userProfile.email?.split('@')[1],
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('AI analysis failed');
      }

      return await response.json();
    } catch (error) {
      console.error('AI analysis error:', error);
      // Fallback to basic analysis
      return {
        riskScore: 0.1,
        recommendations: ['basic-onboarding'],
        onboardingFlow: 'standard',
      };
    }
  }

  // AI-enhanced sign up flow
  static async handleAISignUp(userData: {
    email: string;
    name: string;
    company?: string;
    useCase?: string;
  }): Promise<{
    success: boolean;
    userId?: string;
    onboardingFlow: string;
    recommendations: string[];
    error?: string;
  }> {
    try {
      // Step 1: Analyze user with AI
      const aiAnalysis = await this.analyzeUserBehavior(userData);

      // Step 2: Generate AI-powered recommendations
      const recommendations = await this.generateOnboardingRecommendations(userData, aiAnalysis);

      // Step 3: Create user in database
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          role: 'USER',
        },
      });

      // Step 4: Store AI analysis results
      await this.storeAIAnalysis(user.id, {
        ...aiAnalysis,
        recommendations,
      });

      // Step 5: Trigger AI-powered welcome sequence
      await this.triggerAIWelcomeSequence(user, recommendations);

      return {
        success: true,
        userId: user.id,
        onboardingFlow: aiAnalysis.onboardingFlow,
        recommendations,
      };
    } catch (error) {
      console.error('AI Sign up error:', error);
      return {
        success: false,
        onboardingFlow: 'standard',
        recommendations: ['basic-setup'],
        error: 'Sign up failed. Please try again.',
      };
    }
  }

  // AI-enhanced sign in flow
  static async handleAISignIn(userData: {
    email: string;
    authProvider?: string;
  }): Promise<{
    success: boolean;
    user?: User;
    recommendations?: string[];
    securityAlerts?: string[];
    error?: string;
  }> {
    try {
      // Step 1: Find user
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
        include: { organization: true },
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Step 2: AI-powered login analysis
      const loginAnalysis = await this.analyzeLoginAttempt({
        userId: user.id,
        email: userData.email,
        timestamp: new Date(),
        provider: userData.authProvider,
      });

      // Step 3: Generate contextual recommendations
      const recommendations = await this.generateLoginRecommendations(user, loginAnalysis);

      // Step 4: Check for security alerts
      const securityAlerts = loginAnalysis.riskScore > 0.7 
        ? await this.generateSecurityAlerts(loginAnalysis)
        : [];

      // Step 5: Update last login and activity
      await prisma.user.update({
        where: { id: user.id },
        data: { updatedAt: new Date() },
      });

      return {
        success: true,
        user: user as User,
        recommendations,
        securityAlerts,
      };
    } catch (error) {
      console.error('AI Sign in error:', error);
      return {
        success: false,
        error: 'Sign in failed. Please try again.',
      };
    }
  }

  private static async generateOnboardingRecommendations(
    userData: any,
    aiAnalysis: any
  ): Promise<string[]> {
    try {
      const response = await fetch(`${process.env.AI_SERVICE_URL}/generate-onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.AI_SERVICE_API_KEY}`,
        },
        body: JSON.stringify({
          userProfile: userData,
          analysis: aiAnalysis,
          prompt: `Generate personalized onboarding recommendations for a user joining Architects Suite, a diagramming platform. Consider their background and use case.`,
        }),
      });

      const result = await response.json();
      return result.recommendations || ['explore-templates', 'create-first-diagram'];
    } catch (error) {
      console.error('Failed to generate AI recommendations:', error);
      return ['explore-templates', 'create-first-diagram'];
    }
  }

  private static async analyzeLoginAttempt(loginData: any): Promise<any> {
    try {
      const response = await fetch(`${process.env.AI_SERVICE_URL}/analyze-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.AI_SERVICE_API_KEY}`,
        },
        body: JSON.stringify(loginData),
      });

      return await response.json();
    } catch (error) {
      console.error('Login analysis failed:', error);
      return { riskScore: 0.1, patterns: [] };
    }
  }

  private static async generateLoginRecommendations(user: User, analysis: any): Promise<string[]> {
    try {
      const response = await fetch(`${process.env.AI_SERVICE_URL}/generate-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.AI_SERVICE_API_KEY}`,
        },
        body: JSON.stringify({
          user: {
            id: user.id,
            role: user.role,
            lastActivity: user.updatedAt,
          },
          analysis,
          context: 'login',
        }),
      });

      const result = await response.json();
      return result.recommendations || ['check-recent-diagrams'];
    } catch (error) {
      console.error('Failed to generate login recommendations:', error);
      return ['check-recent-diagrams'];
    }
  }

  private static async generateSecurityAlerts(analysis: any): Promise<string[]> {
    const alerts = [];
    
    if (analysis.riskScore > 0.8) {
      alerts.push('High-risk login detected. Please verify your identity.');
    }
    
    if (analysis.unusualLocation) {
      alerts.push('Login from new location detected.');
    }
    
    if (analysis.multipleAttempts) {
      alerts.push('Multiple login attempts detected.');
    }
    
    return alerts;
  }

  private static async storeAIAnalysis(userId: string, analysis: any): Promise<void> {
    try {
      // Store in a separate analytics table or external service
      await fetch(`${process.env.ANALYTICS_SERVICE_URL}/store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ANALYTICS_API_KEY}`,
        },
        body: JSON.stringify({
          userId,
          type: 'auth_analysis',
          data: analysis,
          timestamp: new Date(),
        }),
      });
    } catch (error) {
      console.error('Failed to store AI analysis:', error);
    }
  }

  private static async triggerAIWelcomeSequence(user: User, recommendations: string[]): Promise<void> {
    try {
      // Trigger AI-powered welcome email sequence
      await fetch(`${process.env.EMAIL_SERVICE_URL}/trigger-sequence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EMAIL_API_KEY}`,
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          name: user.name,
          sequence: 'ai-welcome',
          personalization: {
            recommendations,
            userProfile: {
              name: user.name,
              role: user.role,
            },
          },
        }),
      });
    } catch (error) {
      console.error('Failed to trigger AI welcome sequence:', error);
    }
  }

  // External OAuth integration with AI enhancement
  static async handleOAuthCallback(provider: string, profile: any): Promise<{
    success: boolean;
    user?: User;
    isNewUser: boolean;
    aiRecommendations?: string[];
    error?: string;
  }> {
    try {
      // Step 1: Check if user exists
      let user = await prisma.user.findUnique({
        where: { email: profile.email },
      });

      const isNewUser = !user;

      // Step 2: Create or update user
      if (!user) {
        // New user - use AI-enhanced signup
        const signupResult = await this.handleAISignUp({
          email: profile.email,
          name: profile.name,
          company: profile.company,
        });

        if (!signupResult.success) {
          return {
            success: false,
            isNewUser: true,
            error: signupResult.error,
          };
        }

        user = await prisma.user.findUnique({
          where: { id: signupResult.userId },
        });

        return {
          success: true,
          user: user as User,
          isNewUser: true,
          aiRecommendations: signupResult.recommendations,
        };
      } else {
        // Existing user - use AI-enhanced signin
        const signinResult = await this.handleAISignIn({
          email: profile.email,
          authProvider: provider,
        });

        return {
          success: signinResult.success,
          user: signinResult.user,
          isNewUser: false,
          aiRecommendations: signinResult.recommendations,
          error: signinResult.error,
        };
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      return {
        success: false,
        isNewUser: false,
        error: 'Authentication failed. Please try again.',
      };
    }
  }
}