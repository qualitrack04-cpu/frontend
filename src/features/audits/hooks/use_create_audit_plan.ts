import { useState, useEffect, useMemo } from 'react';
import { useNavigate,} from 'react-router-dom';
import {
  createAuditPlan,
  getAuditPlanById,
  updateAuditPlan,
  type AuditPriority,
} from '../api/audit_plan_api';
import { getAuditors, type Auditor } from '../api/auditors_api';
import { getChecklists, type ChecklistListItem } from '../api/checklist_api';
import { getDepartments } from '../api/department_api'; 

export function useCreateAuditPlan(planId?: string) {
  const isEdit = !! planId;

  const [title, setTitle] = useState('');
  const [leadAuditorId, setLeadAuditorId] = useState('');
  const [department, setDepartment] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scopeDescription, setScopeDescription] = useState('');
  const [checklistId, setChecklistId] = useState('');
  const [highPriority, setHighPriority] = useState(false);

  const [auditors, setAuditors] = useState<Auditor[]>([]);
  const [checklists, setChecklists] = useState<ChecklistListItem[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [loadingPlan, setLoadingPlan] = useState(isEdit);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(!isEdit);

  const [titleError, setTitleError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    Promise.allSettled([getAuditors(), getChecklists(), getDepartments()]).then(([auditorsResult, checklistsResult, departmentsResult]) => {
      const errors: string[] = [];

      if (auditorsResult.status === 'fulfilled') {
        setAuditors(auditorsResult.value);
      } else {
        const status = auditorsResult.reason?.response?.status;
        errors.push(
          status === 403
            ? 'Failed to load auditor list: insufficient permissions (Admin/QualityManager role required).'
            : (auditorsResult.reason?.response?.data?.message ?? 'Failed to load auditor list.')
        );
      }

      if (checklistsResult.status === 'fulfilled') {
        setChecklists(checklistsResult.value);
      } else {
        errors.push(checklistsResult.reason?.response?.data?.message ?? 'Failed to load checklist list.');
      }
      if (departmentsResult.status === 'fulfilled') {
        setDepartments(departmentsResult.value.filter((d) => d.isActive).map((d) => d.name));
      } else {
        errors.push(departmentsResult.reason?.response?.data?.message ?? 'Gagal memuat daftar department.');

      }

      if (errors.length > 0) setSubmitError(errors.join(' '));
      setLoadingOptions(false);
    });
  }, []);

  useEffect(() => {
    if (!planId || loadingOptions) return;

    let cancelled = false;
    setLoadingPlan(true);
    setLoadError(null);

    getAuditPlanById(planId)
      .then((plan) => {
        if (cancelled) return;
        const schedule = plan.schedules[0];

        setTitle(plan.title);
        setScopeDescription(plan.description ?? '');
        setHighPriority(plan.priority === 'Priority');

        if (schedule) {
          setDepartment(schedule.department);
          setScheduledDate(schedule.scheduledDate.slice(0, 10));

          const matchedAuditor =
            (schedule.auditorId && auditors.find((a) => a.id === schedule.auditorId)) ||
            auditors.find((a) => a.fullName === schedule.auditorName);
          setLeadAuditorId(matchedAuditor?.id ?? '');

          const matchedChecklist = checklists.find(
            (c) => c.title === schedule.clauseRef && c.isoStandardName === plan.standard
          );
          setChecklistId(matchedChecklist?.id ?? '');
        }

        setInitialized(true);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setLoadError(err.response?.data?.message ?? 'Failed to load audit plan data.');
      })
      .finally(() => {
        if (!cancelled) setLoadingPlan(false);
      });

    return () => {
      cancelled = true;
    };
  }, [planId, loadingOptions]);

  const filteredChecklists = useMemo(
    () => (department ? checklists.filter((c) => c.departmentName === department) : []),
    [department, checklists]
  );

  useEffect(() => {
    if (!initialized) return;
    if (filteredChecklists.some((c) => c.id === checklistId)) return;
    setChecklistId(filteredChecklists[0]?.id ?? '');
  }, [filteredChecklists, initialized]);

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
      setSubmitError('Please select a Lead Auditor first.');
      return;
    }
    if (!department) {
      setSubmitError('Please select a Department first.');
      return;
    }
    if (!scheduledDate) {
      setSubmitError('Isi Scheduled Date terlebih dahulu.');
      return;
    }

    const year = Number(scheduledDate.split('-')[0]);
    const maxYear = new Date().getFullYear() + 5;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate) || year < 2000 || year > maxYear) {
      setSubmitError(`Invalid date. Year must be between 2000 and ${maxYear}.`);
      return;
    }

    if (!selectedChecklist) {
      setSubmitError('Please select an ISO Template first.');
      return;
    }

    const priority: AuditPriority = highPriority ? 'Priority' : 'Common';
    const schedules = [
      {
        clauseRef: selectedChecklist.title,
        auditorName: selectedAuditor.fullName,
        department,
        scheduledDate: new Date(scheduledDate).toISOString(),
      },
    ];

    setSubmitting(true);
    try {
      if (isEdit && planId) {
        await updateAuditPlan(planId, {
          title,
          year,
          standard: selectedChecklist.isoStandardName,
          priority,
          description: scopeDescription || undefined,
          schedules,
        });
      } else {
        await createAuditPlan({
          title,
          year,
          standard: selectedChecklist.isoStandardName,
          priority,
          description: scopeDescription || undefined,
          schedules,
        });
      }
      navigate('/audits');
    } catch (err: any) {
      const data = err.response?.data;

      const validationMessages = data?.errors
        ? Object.values(data.errors as Record<string, string[]>).flat().join(' ')
        : null;

      const message =
        data?.message ?? validationMessages ?? data?.title ?? `Failed to ${isEdit ? 'save changes to' : 'create'} audit plan.`;
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
    isEdit,
    title, setTitle,
    leadAuditorId, setLeadAuditorId,
    department, setDepartment,
    scheduledDate, setScheduledDate,
    scopeDescription, setScopeDescription,
    checklistId, setChecklistId,
    highPriority, setHighPriority,
    auditors,
    departments,
    checklists: filteredChecklists,
    loadingOptions,
    loadingPlan,
    loadError,
    titleError,
    submitError,
    submitting,
    handleSubmit,
  };
}