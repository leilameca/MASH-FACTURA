import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { PageHeader } from '../ui/PageHeader';

export function ModuleEmptyPage({ title, subtitle, icon, actionLabel, emptyTitle, emptyDescription, premium = false }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={<Button icon={Plus} variant={premium ? 'champagne' : 'primary'}>{actionLabel}</Button>}
      />
      <Card>
        <EmptyState
          action={{ label: actionLabel, icon: Plus }}
          description={emptyDescription}
          icon={icon}
          title={emptyTitle}
        />
      </Card>
    </div>
  );
}
