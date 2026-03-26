import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Send, ArrowLeft, MoreVertical, Pencil, Trash2, Archive, ArchiveRestore } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  read_at: string | null;
  edited_at: string | null;
  deleted_by: string | null;
  deleted_at: string | null;
  sender?: {
    full_name: string;
    avatar_url: string | null;
  };
  recipient?: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface Conversation {
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export default function Messages() {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [archivedConversations, setArchivedConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [viewingArchived, setViewingArchived] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const fetchConversations = async () => {
      // Fetch sent messages
      const { data: sentMessages } = await supabase
        .from('direct_messages')
        .select('recipient_id, content, created_at, is_read')
        .eq('sender_id', currentUserId)
        .order('created_at', { ascending: false });

      // Fetch received messages
      const { data: receivedMessages } = await supabase
        .from('direct_messages')
        .select('sender_id, content, created_at, is_read')
        .eq('recipient_id', currentUserId)
        .order('created_at', { ascending: false });

      // Get all unique user IDs
      const userIds = new Set<string>();
      sentMessages?.forEach(msg => userIds.add(msg.recipient_id));
      receivedMessages?.forEach(msg => userIds.add(msg.sender_id));

      // Fetch profiles for all users
      const { data: profiles } = await supabase
        .rpc('get_profiles_safe', { p_user_ids: Array.from(userIds) });

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Group messages by conversation partner
      const conversationMap = new Map<string, Conversation>();

      sentMessages?.forEach((msg: any) => {
        const userId = msg.recipient_id;
        const profile = profilesMap.get(userId);
        if (!conversationMap.has(userId)) {
          conversationMap.set(userId, {
            user_id: userId,
            user_name: profile?.full_name || 'Unknown',
            user_avatar: profile?.avatar_url || null,
            last_message: msg.content,
            last_message_time: msg.created_at,
            unread_count: 0
          });
        }
      });

      receivedMessages?.forEach((msg: any) => {
        const userId = msg.sender_id;
        const profile = profilesMap.get(userId);
        const existing = conversationMap.get(userId);
        if (!existing || new Date(msg.created_at) > new Date(existing.last_message_time)) {
          conversationMap.set(userId, {
            user_id: userId,
            user_name: profile?.full_name || 'Unknown',
            user_avatar: profile?.avatar_url || null,
            last_message: msg.content,
            last_message_time: msg.created_at,
            unread_count: existing?.unread_count || 0
          });
        }
        if (!msg.is_read) {
          const conv = conversationMap.get(userId);
          if (conv) conv.unread_count++;
        }
      });

      // Fetch archived conversations
      const { data: archivedConvs } = await supabase
        .from('conversation_archives')
        .select('other_user_id')
        .eq('user_id', currentUserId);

      const archivedUserIds = new Set(archivedConvs?.map(a => a.other_user_id) || []);

      // Separate active and archived conversations
      const allConversations = Array.from(conversationMap.values());
      const activeConversations = allConversations
        .filter(conv => !archivedUserIds.has(conv.user_id))
        .sort((a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime());
      
      const archived = allConversations
        .filter(conv => archivedUserIds.has(conv.user_id))
        .sort((a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime());

      setConversations(activeConversations);
      setArchivedConversations(archived);
    };

    fetchConversations();

    // Subscribe to new messages
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'direct_messages',
          filter: `recipient_id=eq.${currentUserId}`
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!selectedConversation || !currentUserId) return;

    const fetchMessages = async () => {
      // Fetch messages
      const { data: messagesData } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${selectedConversation}),and(sender_id.eq.${selectedConversation},recipient_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true });

      if (messagesData) {
        // Fetch profiles for sender and recipient
        const userIds = Array.from(new Set([...messagesData.map(m => m.sender_id), ...messagesData.map(m => m.recipient_id)]));
        const { data: profilesData } = await supabase
          .rpc('get_profiles_safe', { p_user_ids: userIds });

        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

        const enrichedMessages = messagesData.map(msg => ({
          ...msg,
          sender: profilesMap.get(msg.sender_id) || { full_name: 'Unknown', avatar_url: null },
          recipient: profilesMap.get(msg.recipient_id) || { full_name: 'Unknown', avatar_url: null }
        }));

        setMessages(enrichedMessages as Message[]);
        
        // Mark messages as read
        const unreadIds = messagesData
          .filter(msg => msg.recipient_id === currentUserId && !msg.is_read)
          .map(msg => msg.id);
        
        if (unreadIds.length > 0) {
          await supabase
            .from('direct_messages')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .in('id', unreadIds);
        }
      }
    };

    fetchMessages();

    // Subscribe to new messages in this conversation
    const channel = supabase
      .channel('conversation')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'direct_messages'
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation, currentUserId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUserId) return;

    setSending(true);
    try {
      const { data: sentMessage, error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: currentUserId,
          recipient_id: selectedConversation,
          content: newMessage.trim()
        })
        .select()
        .single();

      if (error) throw error;

      // Send email notification
      if (sentMessage) {
        try {
          await supabase.functions.invoke('send-dm-notification', {
            body: {
              messageId: sentMessage.id,
              recipientId: selectedConversation,
              senderId: currentUserId,
              content: newMessage.trim()
            }
          });
        } catch (emailError) {
          console.error('Failed to send DM email notification:', emailError);
          // Don't throw - message was sent successfully
        }
      }

      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const editMessage = async (messageId: string, newContent: string) => {
    if (!newContent.trim()) return;

    try {
      const { error } = await supabase
        .from('direct_messages')
        .update({ 
          content: newContent.trim(),
          edited_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', currentUserId);

      if (error) throw error;

      toast.success("Message updated");
      setEditingMessageId(null);
      setEditingContent("");
    } catch (error) {
      console.error('Error editing message:', error);
      toast.error("Failed to edit message");
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('direct_messages')
        .update({ 
          deleted_by: currentUserId,
          deleted_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) throw error;

      // Update local state immediately
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId 
            ? { ...msg, deleted_by: currentUserId, deleted_at: new Date().toISOString() }
            : msg
        )
      );

      toast.success("Message deleted");
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error("Failed to delete message");
    }
  };

  const archiveConversation = async () => {
    if (!selectedConversation || !currentUserId) return;

    try {
      const { error } = await supabase
        .from('conversation_archives')
        .upsert({
          user_id: currentUserId,
          other_user_id: selectedConversation
        });

      if (error) throw error;

      // Move conversation from active to archived
      const conversationToArchive = conversations.find(c => c.user_id === selectedConversation);
      if (conversationToArchive) {
        setArchivedConversations(prev => [conversationToArchive, ...prev]);
      }
      
      setConversations(prevConversations => 
        prevConversations.filter(conv => conv.user_id !== selectedConversation)
      );

      toast.success("Conversation archived");
      setArchiveDialogOpen(false);
      setSelectedConversation(null);
    } catch (error) {
      console.error('Error archiving conversation:', error);
      toast.error("Failed to archive conversation");
    }
  };

  const unarchiveConversation = async (userId: string) => {
    if (!currentUserId) return;

    try {
      const { error } = await supabase
        .from('conversation_archives')
        .delete()
        .eq('user_id', currentUserId)
        .eq('other_user_id', userId);

      if (error) throw error;

      // Move conversation from archived to active
      const conversationToUnarchive = archivedConversations.find(c => c.user_id === userId);
      if (conversationToUnarchive) {
        setConversations(prev => [conversationToUnarchive, ...prev]);
      }
      
      setArchivedConversations(prev => 
        prev.filter(conv => conv.user_id !== userId)
      );

      toast.success("Conversation restored");
    } catch (error) {
      console.error('Error unarchiving conversation:', error);
      toast.error("Failed to restore conversation");
    }
  };

  if (!selectedConversation) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Messages</h1>
        </div>
        <Card className="p-6">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="active">
                Active {conversations.length > 0 && `(${conversations.length})`}
              </TabsTrigger>
              <TabsTrigger value="archived">
                Archived {archivedConversations.length > 0 && `(${archivedConversations.length})`}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active">
              <h2 className="text-xl font-semibold mb-4">Active Conversations</h2>
              {conversations.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No active conversations</p>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <button
                      key={conv.user_id}
                      onClick={() => setSelectedConversation(conv.user_id)}
                      className="w-full flex items-center gap-3 p-4 hover:bg-accent rounded-lg transition-colors text-left"
                    >
                      <Avatar>
                        <AvatarImage src={conv.user_avatar || undefined} />
                        <AvatarFallback>{conv.user_name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{conv.user_name}</p>
                          {conv.unread_count > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {conv.unread_count}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{conv.last_message}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conv.last_message_time), { addSuffix: true })}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="archived">
              <h2 className="text-xl font-semibold mb-4">Archived Conversations</h2>
              {archivedConversations.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No archived conversations</p>
              ) : (
                <div className="space-y-2">
                  {archivedConversations.map((conv) => (
                    <div
                      key={conv.user_id}
                      className="w-full flex items-center gap-3 p-4 bg-muted/50 rounded-lg"
                    >
                      <Avatar>
                        <AvatarImage src={conv.user_avatar || undefined} />
                        <AvatarFallback>{conv.user_name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{conv.user_name}</p>
                        <p className="text-sm text-muted-foreground truncate">{conv.last_message}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conv.last_message_time), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            unarchiveConversation(conv.user_id);
                          }}
                        >
                          <ArchiveRestore className="h-4 w-4 mr-2" />
                          Restore
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedConversation(conv.user_id)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    );
  }

  const selectedConv = conversations.find(c => c.user_id === selectedConversation);

  return (
    <div className="container mx-auto p-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedConversation(null)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar>
              <AvatarImage src={selectedConv?.user_avatar || undefined} />
              <AvatarFallback>{selectedConv?.user_name[0]}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold">{selectedConv?.user_name}</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setArchiveDialogOpen(true)}
          >
            <Archive className="h-5 w-5" />
          </Button>
        </div>
        
        <Separator className="mb-4" />
        
        <ScrollArea className="h-[500px] mb-4 pr-4">
          <div className="space-y-4">
            {messages.map((message) => {
              const isSent = message.sender_id === currentUserId;
              const isDeleted = message.deleted_at !== null;
              const isEditing = editingMessageId === message.id;
              
              if (isDeleted) {
                return (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${isSent ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {isSent ? 'You' : message.sender?.full_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} max-w-[70%]`}>
                      <div className="rounded-lg px-4 py-2 bg-muted/50 italic text-muted-foreground">
                        <p>Message deleted</p>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                );
              }
              
              return (
                <div
                  key={message.id}
                  className={`flex gap-2 ${isSent ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={isSent ? message.sender?.avatar_url || undefined : message.sender?.avatar_url || undefined} />
                    <AvatarFallback>
                      {isSent ? 'You' : message.sender?.full_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    <div className={`flex items-start gap-2 ${isSent ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          isSent
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {isEditing ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              className="min-w-[200px]"
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => editMessage(message.id, editingContent)}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingMessageId(null);
                                  setEditingContent("");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p>{message.content}</p>
                            {message.edited_at && (
                              <span className="text-xs opacity-70 block mt-1">
                                (edited)
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      {!isEditing && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={isSent ? "end" : "start"}>
                            {isSent && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingMessageId(message.id);
                                  setEditingContent(message.content);
                                }}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => {
                                setMessageToDelete(message.id);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="resize-none"
            rows={3}
          />
          <Button
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => messageToDelete && deleteMessage(messageToDelete)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive this conversation? You can restore it later from archived messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={archiveConversation}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
