import { MessageSquare, Plus } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
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
}

export function AppSidebar({
  conversations,
  currentConversationId,
  onNewConversation,
  onSelectConversation,
}: AppSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

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
                    <SidebarMenuButton
                      onClick={() => onSelectConversation(conversation.id)}
                      isActive={isActive}
                      className="cursor-pointer"
                      tooltip={isCollapsed ? conversation.title : undefined}
                    >
                      <MessageSquare className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="truncate">{conversation.title}</span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
