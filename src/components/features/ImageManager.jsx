import { Camera, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { createRow, deleteRow, listRows } from '../../services/crudService';
import { uploadFile } from '../../services/storageService';

const imageTypes = [
  { value: 'reference', label: 'Referencia' },
  { value: 'before', label: 'Antes' },
  { value: 'during', label: 'Proceso' },
  { value: 'after', label: 'Después' },
  { value: 'other', label: 'Otro' },
];

export function ImageManager({ parentId, table, foreignKey, bucket, title = 'Imágenes' }) {
  const [rows, setRows] = useState([]);
  const [file, setFile] = useState(null);
  const [imageType, setImageType] = useState('reference');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await listRows(table, { filters: { [foreignKey]: parentId }, orderBy: 'created_at' });
      setRows(data);
    } catch (err) {
      setError(err.message);
    }
  }, [foreignKey, parentId, table]);

  useEffect(() => {
    load();
  }, [load]);

  async function upload() {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const result = await uploadFile(bucket, file, parentId);
      await createRow(table, {
        [foreignKey]: parentId,
        image_url: result.publicUrl,
        storage_path: result.path,
        image_type: imageType,
      });
      setFile(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function remove(row) {
    setLoading(true);
    try {
      await deleteRow(table, row.id);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-mash-text1">{title}</h3>
        <Camera className="h-5 w-5 text-mash-text3" />
      </div>
      {error ? <p className="mb-3 rounded-[10px] border border-red-200 bg-red-50 p-3 text-sm text-red-900">{error}</p> : null}
      <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
        <input
          accept="image/*"
          className="block w-full rounded-[10px] border border-mash-borderMd bg-white text-sm text-mash-text3 file:mr-4 file:min-h-10 file:border-0 file:bg-mash-brand file:px-4 file:text-sm file:font-semibold file:text-white"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          type="file"
        />
        <Select onChange={(event) => setImageType(event.target.value)} value={imageType}>
          {imageTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
        </Select>
        <Button disabled={!file} loading={loading} onClick={upload}>Subir</Button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => (
          <div className="overflow-hidden rounded-2xl border border-mash-border bg-mash-bg" key={row.id}>
            <img alt={row.caption || row.image_type} className="aspect-video w-full object-cover" src={row.image_url} />
            <div className="flex items-center justify-between p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.04em] text-mash-text3">{row.image_type}</p>
              <button className="grid h-8 w-8 place-items-center rounded-[8px] text-red-800 hover:bg-red-50" disabled={loading} onClick={() => remove(row)} type="button">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {!rows.length ? <p className="text-sm text-mash-text3">Sin imágenes todavía.</p> : null}
      </div>
    </Card>
  );
}
