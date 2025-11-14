import { useState } from "react";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
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
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface AppSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

export function AppSidebar({
  conversations,
  currentConversationId,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
}: AppSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <h2 className="text-sm font-semibold text-sidebar-foreground">Conversas</h2>
        )}
        <SidebarTrigger />
      </div>

      <div className="p-2">
        <Button
          onClick={onNewConversation}
          className="w-full justify-start gap-2"
          variant="outline"
          size={isCollapsed ? "icon" : "default"}
        >
          <Plus className="h-4 w-4" />
          {!isCollapsed && <span>Nova Conversa</span>}
        </Button>
      </div>

      <SidebarContent>
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel>Histórico</SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {conversations.map((conversation) => {
                const isActive = conversation.id === currentConversationId;
                return (
                  <SidebarMenuItem key={conversation.id}>
                    <div className="group flex items-center gap-1 w-full">
                      <SidebarMenuButton
                        onClick={() => onSelectConversation(conversation.id)}
                        isActive={isActive}
                        className="cursor-pointer flex-1"
                        tooltip={isCollapsed ? conversation.title : undefined}
                      >
                        <MessageSquare className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && (
                          <span className="truncate">{conversation.title}</span>
                        )}
                      </SidebarMenuButton>
                      {!isCollapsed && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConversationToDelete(conversation.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <AlertDialog open={conversationToDelete !== null} onOpenChange={(open) => !open && setConversationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar conversa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A conversa será permanentemente removida do seu histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (conversationToDelete) {
                  onDeleteConversation(conversationToDelete);
                  setConversationToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}
