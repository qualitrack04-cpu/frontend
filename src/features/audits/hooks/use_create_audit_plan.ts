import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createAuditPlan,
  getAuditPlanById,
  updateAuditPlan,
  type AuditPriority,
} from '../api/audit_plan_api';
import { getAuditors, type Auditor } from '../api/auditors_api';
import { getChecklists, type ChecklistListItem } from '../api/checklist_api';

export const DEPARTMENTS = ['Production', 'Packaging', 'Warehouse', 'QC'];

export function useCreateAuditPlan() {
  const { planId } = useParams();
  const isEdit = Boolean(planId);

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
      } else {
        errors.push(checklistsResult.reason?.response?.data?.message ?? 'Gagal memuat daftar checklist.');
      }

      if (errors.length > 0) setSubmitError(errors.join(' '));
      setLoadingOptions(false);
    });
  }, []);

  const filteredChecklists = useMemo(
    () => (department ? checklists.filter((c) => c.department === department) : []),
    [department, checklists]
  );

  useEffect(() => {
    if (filteredChecklists.some((c) => c.id === checklistId)) return;
    setChecklistId(filteredChecklists[0]?.id ?? '');
  }, [filteredChecklists, checklistId]);

  // Load existing plan data if in edit mode
  useEffect(() => {
    if (!planId) return;
    getAuditPlanById(planId)
      .then((plan) => {
        setTitle(plan.title);
        setScopeDescription(plan.description ?? '');
        setHighPriority(plan.priority === 'Priority');
        if (plan.schedules && plan.schedules.length > 0) {
          const sch = plan.schedules[0];
          setDepartment(sch.department);
          setScheduledDate(sch.scheduledDate ? sch.scheduledDate.slice(0, 10) : '');
          if (sch.auditorId) {
            setLeadAuditorId(sch.auditorId);
          }
        }
      })
      .catch(() => setSubmitError('Gagal memuat data audit plan.'));
  }, [planId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTitleError(null);
    setSubmitError(null);

    if (!title.trim()) {
      setTitleError('Title is required and must be unique.');
      return;
    }

    const selectedAuditor = auditors.find((a) => a.id === leadAuditorId);
    const selectedChecklist = filteredChecklists.find((c) => c.id === checklistId);

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

    const year = Number(scheduledDate.split('-')[0]);
    const maxYear = new Date().getFullYear() + 5;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate) || year < 2000 || year > maxYear) {
      setSubmitError(`Tanggal tidak valid. Tahun harus antara 2000 dan ${maxYear}.`);
      return;
    }

    if (!selectedChecklist) {
      setSubmitError('Pilih ISO Template terlebih dahulu.');
      return;
    }

    const priority: AuditPriority = highPriority ? 'Priority' : 'Common';

    setSubmitting(true);
    try {
      const payload = {
        title,
        year,
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
      };

      if (planId) {
        await updateAuditPlan(planId, payload);
      } else {
        await createAuditPlan(payload);
      }
      navigate('/audits');
    } catch (err: any) {
      const data = err.response?.data;

      const validationMessages = data?.errors
        ? Object.values(data.errors as Record<string, string[]>).flat().join(' ')
        : null;

      const message =
        data?.message ?? validationMessages ?? data?.title ?? 'Gagal menyimpan audit plan.';

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
    checklists: filteredChecklists,
    loadingOptions,
    titleError,
    submitError,
    submitting,
    handleSubmit,
    isEdit,
    planId,
  };
}