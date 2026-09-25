import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChecklistItems, updateChecklist } from '../api/checklist_api';

export const STANDARDS = [
  { value: 'ISO9001', label: 'ISO 9001' },
  { value: 'ISO14001', label: 'ISO 14001' },
  { value: 'GMP', label: 'GMP' },
];

export interface EditableChecklistItem {
  key: string;      // key lokal untuk React (item baru belum punya id)
  id?: string;      // id dari backend, kosong untuk item baru
  question: string;
  description: string;
  clauseRef: string;
}

let nextKey = 0;
const newKey = () => `new-${nextKey++}`;

export function useEditChecklist(checklistId: string) {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [standard, setStandard] = useState('');
  const [department, setDepartment] = useState('');
  const [items, setItems] = useState<EditableChecklistItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const data = await getChecklistItems(checklistId);
        if (cancelled) return;
        setTitle(data.title);
        setStandard(data.standard);
        setDepartment(data.department);
        setItems(
          data.items.map((it) => ({
            key: it.id,
            id: it.id,
            question: it.question,
            description: it.description ?? '',
            clauseRef: it.clauseRef,
          }))
        );
      } catch (err: any) {
        if (!cancelled) setLoadError(err.response?.data?.message ?? 'Gagal memuat checklist');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [checklistId]);

  const updateItem = (key: string, field: 'question' | 'description' | 'clauseRef', value: string) => {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, [field]: value } : it)));
  };

  const addItem = () => {
    // Clause ref item baru ikut standard checklist, bisa diubah manual
    setItems((prev) => [...prev, { key: newKey(), question: '', description: '', clauseRef: standard }]);
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((it) => it.key !== key));
  };

  const moveItem = (key: string, direction: -1 | 1) => {
    setItems((prev) => {
      const index = prev.findIndex((it) => it.key === key);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const titleError = showErrors && !title.trim() ? 'Judul checklist wajib diisi' : null;
  const isQuestionMissing = (item: EditableChecklistItem) => showErrors && !item.question.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    setSubmitError(null);

    if (!title.trim()) return;
    if (!standard || !department) {
      setSubmitError('Pilih Standard dan Department terlebih dahulu.');
      return;
    }
    if (items.length === 0) {
      setSubmitError('Checklist minimal punya 1 item.');
      return;
    }
    if (items.some((it) => !it.question.trim())) {
      setSubmitError('Semua item wajib punya pertanyaan.');
      return;
    }

    setSubmitting(true);
    try {
      await updateChecklist(checklistId, {
        title: title.trim(),
        standard,
        department,
        items: items.map((it) => ({
          id: it.id,
          question: it.question.trim(),
          description: it.description.trim() || undefined,
          clauseRef: it.clauseRef.trim(),
        })),
      });
      navigate(-1);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message ?? 'Gagal menyimpan checklist');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    title, setTitle,
    standard, setStandard,
    department, setDepartment,
    items,
    updateItem, addItem, removeItem, moveItem,
    loading, loadError,
    titleError, isQuestionMissing,
    submitError, submitting,
    handleSubmit,
    navigate,
  };
}
