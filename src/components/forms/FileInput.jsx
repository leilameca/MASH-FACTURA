import { Camera } from 'lucide-react';

export function FileInput({ label, accept = 'image/*,application/pdf', onChange }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-mash-text2">{label}</span>
      <span className="flex min-h-12 cursor-pointer items-center gap-3 rounded-[10px] border border-dashed border-mash-borderMd bg-mash-bg px-4 text-sm text-mash-text3 transition hover:border-mash-text4">
        <Camera className="h-4 w-4" />
        Seleccionar archivo
        <input accept={accept} className="sr-only" onChange={(event) => onChange(event.target.files?.[0] ?? null)} type="file" />
      </span>
    </label>
  );
}
