'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  MessageCircle, 
  Send, 
  Eye, 
  EyeOff,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff
} from 'lucide-react';
import { User, Comment, DiagramContent, CollaborationEvent } from '@/types';

interface Collaborator {
  id: string;
  user: User;
  cursor?: { x: number; y: number };
  selection?: string[];
  lastActivity: Date;
  isActive: boolean;
  color: string;
}

interface RealTimeCollaborationProps {
  diagramId: string;
  currentUser: User;
  diagramContent: DiagramContent;
  onContentChange: (content: DiagramContent, event: CollaborationEvent) => void;
  onCommentAdd?: (comment: Comment) => void;
}

export function RealTimeCollaboration({
  diagramId,
  currentUser,
  diagramContent,
  onContentChange,
  onCommentAdd
}: RealTimeCollaborationProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showCollaborators, setShowCollaborators] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifications, setNotifications] = useState<string[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('/api/collaboration', {
      query: { diagramId, userId: currentUser.id }
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      joinDiagram();
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('user-joined', (collaborator: Collaborator) => {
      setCollaborators(prev => [...prev.filter(c => c.id !== collaborator.id), collaborator]);
      addNotification(`${collaborator.user.name} joined the diagram`);
      playSound('join');
    });

    newSocket.on('user-left', (userId: string) => {
      setCollaborators(prev => prev.filter(c => c.id !== userId));
      const user = collaborators.find(c => c.id === userId);
      if (user) {
        addNotification(`${user.user.name} left the diagram`);
        playSound('leave');
      }
    });

    newSocket.on('cursor-update', ({ userId, cursor }: { userId: string, cursor: { x: number, y: number } }) => {
      setCollaborators(prev => prev.map(c => 
        c.id === userId ? { ...c, cursor, lastActivity: new Date() } : c
      ));
    });

    newSocket.on('selection-update', ({ userId, selection }: { userId: string, selection: string[] }) => {
      setCollaborators(prev => prev.map(c => 
        c.id === userId ? { ...c, selection, lastActivity: new Date() } : c
      ));
    });

    newSocket.on('content-change', (event: CollaborationEvent) => {
      if (event.userId !== currentUser.id) {
        onContentChange(event.data.content, event);
        playSound('edit');
      }
    });

    newSocket.on('comment-added', (comment: Comment) => {
      setComments(prev => [...prev, comment]);
      if (comment.userId !== currentUser.id) {
        addNotification(`${comment.userId} added a comment`);
        playSound('comment');
      }
      if (onCommentAdd) {
        onCommentAdd(comment);
      }
    });

    newSocket.on('collaborators-update', (collaboratorsList: Collaborator[]) => {
      setCollaborators(collaboratorsList.filter(c => c.id !== currentUser.id));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [diagramId, currentUser.id]);

  // Mouse movement tracking
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const cursor = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
        
        // Throttle cursor updates
        throttledCursorUpdate(cursor);
      }
    };

    const throttledCursorUpdate = throttle((cursor: { x: number, y: number }) => {
      socket.emit('cursor-move', { diagramId, cursor });
    }, 50);

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [socket, isConnected, diagramId]);

  const joinDiagram = () => {
    if (socket) {
      socket.emit('join-diagram', { 
        diagramId, 
        user: currentUser 
      });
    }
  };

  const sendContentChange = useCallback((content: DiagramContent, changeType: string, details?: any) => {
    if (!socket || !isConnected) return;

    const event: CollaborationEvent = {
      id: `event-${Date.now()}`,
      sessionId: diagramId,
      type: changeType as any,
      userId: currentUser.id,
      data: { content, details },
      timestamp: new Date()
    };

    socket.emit('content-change', event);
  }, [socket, isConnected, diagramId, currentUser.id]);

  const sendSelection = useCallback((selection: string[]) => {
    if (!socket || !isConnected) return;
    
    socket.emit('selection-change', { diagramId, selection });
  }, [socket, isConnected, diagramId]);

  const addComment = () => {
    if (!newComment.trim() || !socket || !isConnected) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      diagramId,
      userId: currentUser.id,
      content: newComment,
      resolved: false,
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    socket.emit('add-comment', comment);
    setNewComment('');
  };

  const addNotification = (message: string) => {
    setNotifications(prev => [...prev, message].slice(-5)); // Keep last 5 notifications
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 5000);
  };

  const playSound = (type: 'join' | 'leave' | 'edit' | 'comment') => {
    if (!soundEnabled) return;
    
    // In a real implementation, you would play actual sound files
    const frequencies = {
      join: 800,
      leave: 400,
      edit: 600,
      comment: 1000
    };
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequencies[type];
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const throttle = <T extends (...args: any[]) => any>(func: T, limit: number): T => {
    let inThrottle: boolean;
    return ((...args: any[]) => {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }) as T;
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Connection Status */}
      <div className="absolute top-4 right-4 z-50">
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
          isConnected 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {/* Collaborators Panel */}
      {showCollaborators && (
        <Card className="absolute top-4 left-4 z-40 w-64">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Collaborators ({collaborators.length + 1})
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCollaborators(false)}
              >
                <EyeOff className="h-3 w-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {/* Current User */}
              <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-xs text-white font-medium">
                    {currentUser.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium">{currentUser.name} (You)</div>
                  <div className="text-xs text-gray-500">Online</div>
                </div>
              </div>

              {/* Other Collaborators */}
              {collaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center space-x-2 p-2 rounded">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: collaborator.color }}
                  >
                    <span className="text-xs text-white font-medium">
                      {collaborator.user.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium">{collaborator.user.name}</div>
                    <div className="text-xs text-gray-500">
                      {collaborator.isActive ? 'Active' : 'Idle'}
                    </div>
                  </div>
                  {collaborator.cursor && (
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Toggle Collaborators Button */}
      {!showCollaborators && (
        <Button
          variant="outline"
          size="sm"
          className="absolute top-4 left-4 z-40"
          onClick={() => setShowCollaborators(true)}
        >
          <Eye className="h-4 w-4 mr-1" />
          Show Collaborators
        </Button>
      )}

      {/* Comments Panel */}
      {showComments && (
        <Card className="absolute bottom-4 right-4 z-40 w-80 max-h-96">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-2" />
                Comments ({comments.length})
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(false)}
              >
                <EyeOff className="h-3 w-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 max-h-48 overflow-y-auto mb-3">
              {comments.map((comment) => (
                <div key={comment.id} className="p-2 bg-gray-50 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{comment.userId}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <input
                ref={commentInputRef}
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addComment()}
                className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded"
              />
              <Button size="sm" onClick={addComment} disabled={!newComment.trim()}>
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floating Action Buttons */}
      <div className="absolute bottom-4 left-4 z-40 flex flex-col space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="h-4 w-4 mr-1" />
          Comments
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSoundEnabled(!soundEnabled)}
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>
      </div>

      {/* Notifications */}
      <div className="absolute top-16 right-4 z-50 space-y-2">
        {notifications.map((notification, index) => (
          <Alert key={index} className="w-64 border-blue-200 bg-blue-50">
            <AlertDescription className="text-sm text-blue-800">
              {notification}
            </AlertDescription>
          </Alert>
        ))}
      </div>

      {/* Cursors */}
      {collaborators.map((collaborator) => 
        collaborator.cursor && (
          <div
            key={`cursor-${collaborator.id}`}
            className="absolute pointer-events-none z-30"
            style={{
              left: collaborator.cursor.x,
              top: collaborator.cursor.y,
              transform: 'translate(-2px, -2px)'
            }}
          >
            <div 
              className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
              style={{ backgroundColor: collaborator.color }}
            />
            <div 
              className="absolute top-4 left-0 px-2 py-1 text-xs text-white rounded shadow-lg whitespace-nowrap"
              style={{ backgroundColor: collaborator.color }}
            >
              {collaborator.user.name}
            </div>
          </div>
        )
      )}

      {/* Selection Indicators */}
      {collaborators.map((collaborator) => 
        collaborator.selection?.map((nodeId) => (
          <div
            key={`selection-${collaborator.id}-${nodeId}`}
            className="absolute pointer-events-none border-2 border-dashed rounded z-20"
            style={{ borderColor: collaborator.color }}
          >
            {/* Selection outline would be positioned based on node position */}
          </div>
        ))
      )}
    </div>
  );
}