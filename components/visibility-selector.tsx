'use client';

import { type ReactNode, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  CheckCircleFillIcon,
  ChevronDownIcon,
  GlobeIcon,
  LockIcon,
} from './icons';
import { useChatVisibility } from '@/hooks/use-chat-visibility';

export type VisibilityType = 'private' | 'public';

const visibilities: Array<{
  id: VisibilityType;
  label: string;
  description: string;
  icon: ReactNode;
}> = [
  {
    id: 'private',
    label: 'Private',
    description: 'Only you can access this chat',
    icon: <LockIcon />,
  },
  {
    id: 'public',
    label: 'Public',
    description: 'Anyone with the link can access this chat',
    icon: <GlobeIcon />,
  },
];

export function VisibilitySelector({
  chatId,
  className,
  selectedVisibilityType,
}: {
  chatId: string;
  selectedVisibilityType: VisibilityType;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [showIntegrationFields, setShowIntegrationFields] = useState(false);
  const [showJiraFields, setShowJiraFields] = useState(false);

  const [integrationCredentials, setIntegrationCredentials] = useState({
    serverUrl: '',
    username: '',
    password: '',
  });

  const [jiraCredentials, setJiraCredentials] = useState({
    jiraUrl: '',
    jiraUser: '',
    jiraToken: '',
  });

  const { visibilityType, setVisibilityType } = useChatVisibility({
    chatId,
    initialVisibilityType: selectedVisibilityType,
  });

  const selectedVisibility = useMemo(
    () => visibilities.find((v) => v.id === visibilityType),
    [visibilityType],
  );

  // 🔹 Logic to check if data exists
  const integrationHasData = Boolean(
    integrationCredentials.serverUrl ||
      integrationCredentials.username ||
      integrationCredentials.password,
  );

  const jiraHasData = Boolean(
    jiraCredentials.jiraUrl ||
      jiraCredentials.jiraUser ||
      jiraCredentials.jiraToken,
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
          className,
        )}
      >
        <Button
          data-testid="visibility-selector"
          variant="outline"
          className="hidden md:flex md:px-2 md:h-[34px]"
        >
          {selectedVisibility?.icon}
          {selectedVisibility?.label}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="min-w-[320px] space-y-1"
        // 🔸 prevent closing when interacting with inputs/buttons
        onPointerDownOutside={(e) => {
          if (e.target instanceof HTMLElement && e.target.closest('input,button')) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          if (e.target instanceof HTMLElement && e.target.closest('input,button')) {
            e.preventDefault();
          }
        }}
      >
        {/* Visibility Options */}
        {visibilities.map((visibility) => (
          <DropdownMenuItem
            key={visibility.id}
            onSelect={() => {
              setVisibilityType(visibility.id);
              setOpen(true);
            }}
            className="gap-4 group/item flex flex-row justify-between items-center"
            data-active={visibility.id === visibilityType}
          >
            <div className="flex flex-col gap-1 items-start">
              {visibility.label}
              {visibility.description && (
                <div className="text-xs text-muted-foreground">
                  {visibility.description}
                </div>
              )}
            </div>
            <div
              className={cn(
                'opacity-0 group-data-[active=true]/item:opacity-100',
                'text-foreground dark:text-foreground',
              )}
            >
              <CheckCircleFillIcon />
            </div>
          </DropdownMenuItem>
        ))}

        <div className="h-px bg-border my-1" />

        {/* ---------- INTEGRATION SECTION ---------- */}
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()} 
          className="flex flex-col items-start gap-2 cursor-pointer"
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('input,button')) return;
            // 🔹 Only one open at a time
            setShowIntegrationFields((prev) => {
              const newState = !prev;
              if (newState) setShowJiraFields(false); // close JIRA when Integration opens
              return newState;
            });
          }}
        >
          <div className="flex w-full justify-between items-center">
            <span className="font-medium">3D Experience</span>
            <input
              type="checkbox"
              checked={integrationHasData}
              readOnly
              className="pointer-events-none"
            />
          </div>

          {showIntegrationFields && (
            <div className="flex flex-col gap-2 w-full mt-2">
              <Input
                placeholder="Server URL"
                value={integrationCredentials.serverUrl}
                onChange={(e) =>
                  setIntegrationCredentials((c) => ({
                    ...c,
                    serverUrl: e.target.value,
                  }))
                }
              />
              <Input
                placeholder="Username"
                value={integrationCredentials.username}
                onChange={(e) =>
                  setIntegrationCredentials((c) => ({
                    ...c,
                    username: e.target.value,
                  }))
                }
              />
              <Input
                placeholder="Password"
                type="password"
                value={integrationCredentials.password}
                onChange={(e) =>
                  setIntegrationCredentials((c) => ({
                    ...c,
                    password: e.target.value,
                  }))
                }
              />
              <Button
                size="sm"
                variant="secondary"
                className="w-full mt-1"
                onClick={() => {
                  console.log('Saving Integration:', integrationCredentials);
                  setShowIntegrationFields(false);
                  setOpen(false);
                }}
              >
                Save Integration
              </Button>
            </div>
          )}
        </DropdownMenuItem>

        <div className="h-px bg-border my-1" />

        {/* ---------- JIRA SECTION ---------- */}
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()} 
          className="flex flex-col items-start gap-2 cursor-pointer"
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('input,button')) return;
            // 🔹 Only one open at a time
            setShowJiraFields((prev) => {
              const newState = !prev;
              if (newState) setShowIntegrationFields(false); // close Integration when JIRA opens
              return newState;
            });
          }}
        >
          <div className="flex w-full justify-between items-center">
            <span className="font-medium">JIRA</span>
            <input
              type="checkbox"
              checked={jiraHasData}
              readOnly
              className="pointer-events-none"
            />
          </div>

          {showJiraFields && (
            <div className="flex flex-col gap-2 w-full mt-2">
              <Input
                placeholder="JIRA URL"
                value={jiraCredentials.jiraUrl}
                onChange={(e) =>
                  setJiraCredentials((c) => ({
                    ...c,
                    jiraUrl: e.target.value,
                  }))
                }
              />
              <Input
                placeholder="JIRA Username / Email"
                value={jiraCredentials.jiraUser}
                onChange={(e) =>
                  setJiraCredentials((c) => ({
                    ...c,
                    jiraUser: e.target.value,
                  }))
                }
              />
              <Input
                placeholder="API Token"
                type="password"
                value={jiraCredentials.jiraToken}
                onChange={(e) =>
                  setJiraCredentials((c) => ({
                    ...c,
                    jiraToken: e.target.value,
                  }))
                }
              />
              <Button
                size="sm"
                variant="secondary"
                className="w-full mt-1"
                onClick={() => {
                  console.log('Saving JIRA:', jiraCredentials);
                  setShowJiraFields(false);
                  setOpen(false);
                }}
              >
                Save JIRA
              </Button>
            </div>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
