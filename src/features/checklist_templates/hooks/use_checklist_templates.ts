import { useState, useEffect, useCallback } from 'react';
import { 
  getChecklistTemplates, 
  getDepartments, 
  getIsoStandards 
} from '../api/checklist_templates_api';
import type { 
  ChecklistTemplateItem, 
  DepartmentOption, 
  IsoOption 
} from '../api/checklist_templates_api';

export function useChecklistTemplates(isoStandardId?: string, departmentId?: string) {
  const [templates, setTemplates] = useState<ChecklistTemplateItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [isoStandards, setIsoStandards] = useState<IsoOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [templatesRes, deptRes, isoRes] = await Promise.all([
        getChecklistTemplates(isoStandardId, departmentId),
        getDepartments().catch(() => []),
        getIsoStandards().catch(() => []),
      ]);
      setTemplates(Array.isArray(templatesRes) ? templatesRes : []);
      setDepartments(Array.isArray(deptRes) ? deptRes : []);
      setIsoStandards(Array.isArray(isoRes) ? isoRes : []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load checklist templates');
    } finally {
      setLoading(false);
    }
  }, [isoStandardId, departmentId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    templates,
    departments,
    isoStandards,
    loading,
    error,
    refetch: fetchAll,
  };
}
