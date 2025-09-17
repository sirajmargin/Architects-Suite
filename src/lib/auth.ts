import { handleAuth, handleLogin, handleLogout, handleCallback } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';

// Auth0 configuration with AI service integration
export default handleAuth({
  login: handleLogin({
    authorizationParams: {
      audience: process.env.AUTH0_AUDIENCE,
      scope: 'openid profile email offline_access',
    },
    returnTo: '/dashboard'
  }),
  logout: handleLogout({
    returnTo: '/'
  }),
  callback: handleCallback({
    afterCallback: async (req: NextApiRequest, res: NextApiResponse, session: any) => {
      // Custom logic after successful authentication
      // This is where we can integrate with AI services for user onboarding
      
      try {
        // Call AI service to analyze user profile and suggest initial setup
        await integrateWithAIServices(session.user);
        
        // Create user in our database if not exists
        await createOrUpdateUser(session.user);
        
        return session;
      } catch (error) {
        console.error('Error in auth callback:', error);
        return session;
      }
    }
  }),
  signup: handleLogin({
    authorizationParams: {
      screen_hint: 'signup',
      audience: process.env.AUTH0_AUDIENCE,
      scope: 'openid profile email offline_access',
    },
    returnTo: '/onboarding'
  })
});

// AI-powered user onboarding service
async function integrateWithAIServices(user: any) {
  try {
    // Analyze user profile with AI to suggest personalized setup
    const aiAnalysis = await analyzeUserProfile(user);
    
    // Store AI recommendations for user onboarding
    await storeAIRecommendations(user.sub, aiAnalysis);
    
    // Send personalized welcome email using AI-generated content
    await sendAIPersonalizedWelcome(user);
  } catch (error) {
    console.error('AI integration error:', error);
    // Fallback to standard onboarding
  }
}

async function analyzeUserProfile(user: any) {
  // This would integrate with OpenAI/Anthropic to analyze user profile
  // and suggest optimal onboarding flow
  const response = await fetch('/api/ai/analyze-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: user.email,
      name: user.name,
      picture: user.picture,
      // Add any other profile data
    })
  });
  
  return response.json();
}

async function createOrUpdateUser(user: any) {
  const response = await fetch('/api/users/upsert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      authId: user.sub,
      email: user.email,
      name: user.name,
      avatar: user.picture,
    })
  });
  
  return response.json();
}

async function storeAIRecommendations(userId: string, recommendations: any) {
  await fetch('/api/ai/store-recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      recommendations
    })
  });
}

async function sendAIPersonalizedWelcome(user: any) {
  await fetch('/api/ai/send-welcome', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user
    })
  });
}