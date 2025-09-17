import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { CICDBotService } from '@/services/cicdBotService';

// Verify GitHub webhook signature
function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) return false;

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expectedSignature = `sha256=${hmac.digest('hex')}`;
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-hub-signature-256');

    if (!signature || !verifySignature(payload, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(payload);
    const eventType = request.headers.get('x-github-event');

    // Handle push events
    if (eventType === 'push') {
      const repository = event.repository;
      const commits = event.commits;

      // Process each commit
      for (const commit of commits) {
        try {
          // Initialize bot service for this repository
          const botService = new CICDBotService({
            owner: repository.owner.login,
            repo: repository.name,
            token: process.env.GITHUB_BOT_TOKEN!,
            diagramPaths: ['docs/', 'diagrams/', '.github/'],
            excludePaths: ['node_modules/', '.git/']
          });

          // Process the commit
          const result = await botService.processChanges(commit.id);
          
          console.log('Bot processing result:', result);
        } catch (error) {
          console.error('Error processing commit:', commit.id, error);
        }
      }
    }

    // Handle pull request events
    if (eventType === 'pull_request') {
      const action = event.action;
      const pullRequest = event.pull_request;

      if (action === 'opened' || action === 'synchronize') {
        // Validate diagrams in the PR
        // This would involve similar logic to push events
        console.log('Processing PR:', pullRequest.number);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}