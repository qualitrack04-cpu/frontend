import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAuditPlan, type AuditPriority } from '../api/audit_plan_api';
import { getAuditors, type Auditor } from '../api/auditors_api';
import { getChecklists, type ChecklistListItem } from '../api/checklist_api';

export const DEPARTMENTS = ['Production', 'Packaging', 'Warehouse', 'QC'];

export function useCreateAuditPlan() {
  const [title, setTitle] = useState('');
  const [leadAuditorId, setLeadAuditorId] = useState('');
  const [department, setDepartment] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scopeDescription, setScopeDescription] = useState('');
  const [checklistId, setChecklistId] = useState('');
  const [highPriority, setHighPriority] = useState(false);

  const [auditors, setAuditors] = useState<Auditor[]>([]);
  const [checklists, setChecklists] = useState<ChecklistListItem[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [titleError, setTitleError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    Promise.allSettled([getAuditors(), getChecklists()]).then(([auditorsResult, checklistsResult]) => {
      const errors: string[] = [];

      if (auditorsResult.status === 'fulfilled') {
        setAuditors(auditorsResult.value);
      } else {
        const status = auditorsResult.reason?.response?.status;
        errors.push(
          status === 403
            ? 'Gagal memuat daftar auditor: akun Anda tidak punya akses (butuh role Admin/QualityManager).'
            : (auditorsResult.reason?.response?.data?.message ?? 'Gagal memuat daftar auditor.')
        );
      }

      if (checklistsResult.status === 'fulfilled') {
        setChecklists(checklistsResult.value);
        if (checklistsResult.value.length > 0) {
          setChecklistId(checklistsResult.value[0].id); 
        }
      } else {
        errors.push(checklistsResult.reason?.response?.data?.message ?? 'Gagal memuat daftar checklist.');
      }

      if (errors.length > 0) setSubmitError(errors.join(' '));
      setLoadingOptions(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTitleError(null);
    setSubmitError(null);

    if (!title.trim()) {
      setTitleError('Title is required and must be unique.');
      return;
    }

    const selectedAuditor = auditors.find((a) => a.id === leadAuditorId);
    const selectedChecklist = checklists.find((c) => c.id === checklistId);

    if (!selectedAuditor) {
      setSubmitError('Pilih Lead Auditor terlebih dahulu.');
      return;
    }
    if (!department) {
      setSubmitError('Pilih Department terlebih dahulu.');
      return;
    }
    if (!scheduledDate) {
      setSubmitError('Isi Scheduled Date terlebih dahulu.');
      return;
    }
    if (!selectedChecklist) {
      setSubmitError('Pilih ISO Template terlebih dahulu.');
      return;
    }

    const priority: AuditPriority = highPriority ? 'High' : 'Common';

    setSubmitting(true);
    try {
      await createAuditPlan({
        title,
        year: new Date(scheduledDate).getFullYear(),
        standard: selectedChecklist.standard,
        priority,
        description: scopeDescription || undefined,
        schedules: [
          {
            clauseRef: selectedChecklist.title,
            auditorName: selectedAuditor.fullName, 
            department,
            scheduledDate: new Date(scheduledDate).toISOString(),
          },
        ],
      });
      navigate('/audits');
    } catch (err: any) {
      const message = err.response?.data?.message ?? 'Gagal membuat audit plan.';
      if (err.response?.status === 400 && message.toLowerCase().includes('title')) {
        setTitleError(message);
      } else {
        setSubmitError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return {
    title, setTitle,
    leadAuditorId, setLeadAuditorId,
    department, setDepartment,
    scheduledDate, setScheduledDate,
    scopeDescription, setScopeDescription,
    checklistId, setChecklistId,
    highPriority, setHighPriority,
    auditors,
    checklists,
    loadingOptions,
    titleError,
    submitError,
    submitting,
    handleSubmit,
  };
}