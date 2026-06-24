import { Inbox } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-mash-borderMd bg-mash-bg px-6 py-12 text-center">
      <Icon className="mx-auto h-10 w-10 text-mash-borderMd" />
      <h3 className="mt-4 text-base font-semibold text-mash-text2">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-mash-text3">{description}</p>
      {action ? (
        <Button className="mt-6" icon={action.icon} onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
