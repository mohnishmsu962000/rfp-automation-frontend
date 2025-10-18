import React, { createContext, useContext, useState} from 'react';
import { cn } from '@/lib/utils';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, children, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export function TabsTrigger({ value, children, className, icon }: TabsTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => setActiveTab(value)}
      className={cn(
        'group relative inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-2xl transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
        isActive
          ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
          : 'bg-white text-gray-600 hover:text-brand-primary hover:bg-brand-tinted border border-gray-200',
        className
      )}
    >
      {icon && (
        <span className={cn(
          'transition-transform duration-200',
          isActive && 'scale-110'
        )}>
          {icon}
        </span>
      )}
      {children}
      {isActive && (
        <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-transparent opacity-50" />
      )}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  const { activeTab } = context;
  const isActive = activeTab === value;

  if (!isActive) return null;

  return (
    <div
      className={cn(
        'animate-in fade-in-0 slide-in-from-bottom-2 duration-300',
        className
      )}
    >
      {children}
    </div>
  );
}