import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCapaFromFinding } from '../api/capa_api';
import { getFindingsWithoutCapa, type Finding } from '../../findings/api/findings_api';
import { getPicCandidates, type PicCandidate } from '../../auth/api/auth_api';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function useCreateCapa() {
  // ⚠️ "Title" tidak ada di CreateCapaRequest backend. Field ini hanya
  // divalidasi & dipakai di UI form saja, tidak dikirim ke server.
  const [title, setTitle] = useState('');
  const [findingId, setFindingId] = useState('');
  const [description, setDescription] = useState(''); // -> rootCause
  const [actionPlan, setActionPlan] = useState(''); // -> correctiveAction
  const [picId, setPicId] = useState('');
  const [deadline, setDeadline] = useState(todayIso());

  const [findings, setFindings] = useState<Finding[]>([]);
  const [pics, setPics] = useState<PicCandidate[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [findingsError, setFindingsError] = useState<string | null>(null);

  const [titleError, setTitleError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [actionPlanError, setActionPlanError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    Promise.allSettled([getFindingsWithoutCapa(), getPicCandidates()]).then(
      ([findingsResult, picsResult]) => {
        if (findingsResult.status === 'fulfilled') {
          setFindings(findingsResult.value);
          if (findingsResult.value.length === 0) {
            setFindingsError('Tidak ada finding tersedia');
          }
        } else {
          setFindingsError(
            findingsResult.reason?.response?.data?.message ?? 'Gagal memuat daftar finding.'
          );
        }

        if (picsResult.status === 'fulfilled') {
          setPics(picsResult.value);
        }

        setLoadingOptions(false);
      }
    );
  }, []);

  function refreshFindings() {
    setFindingsError(null);
    setLoadingOptions(true);
    getFindingsWithoutCapa()
      .then((result: Finding[]) => {
        setFindings(result);
        if (result.length === 0) setFindingsError('Tidak ada finding tersedia');
      })
      .catch((err: any) => {
        setFindingsError(err.response?.data?.message ?? 'Gagal memuat daftar finding.');
      })
      .finally(() => setLoadingOptions(false));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTitleError(null);
    setDescriptionError(null);
    setActionPlanError(null);
    setSubmitError(null);

    let hasError = false;
    if (title.trim().length < 5) {
      setTitleError('Required (Min. 5 characters)');
      hasError = true;
    }
    if (description.trim().length < 10) {
      setDescriptionError('Required (Min. 10 characters)');
      hasError = true;
    }
    if (actionPlan.trim().length < 10) {
      setActionPlanError('Required (Min. 10 characters)');
      hasError = true;
    }
    if (!findingId) {
      setSubmitError('Pilih Linked Finding terlebih dahulu.');
      hasError = true;
    }
    if (!picId) {
      setSubmitError('Pilih Assignee / PIC terlebih dahulu.');
      hasError = true;
    }
    if (!deadline) {
      setSubmitError('Isi Target Date terlebih dahulu.');
      hasError = true;
    }
    if (hasError) return;

    setSubmitting(true);
    try {
      const capa = await createCapaFromFinding(findingId, {
        rootCause: description,
        correctiveAction: actionPlan,
        deadline,
        picId: picId || undefined,
      });
      navigate(`/capa/${capa.id}`);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message ?? 'Gagal membuat CAPA.');
    } finally {
      setSubmitting(false);
    }
  }

  return {
    title, setTitle,
    findingId, setFindingId,
    description, setDescription,
    actionPlan, setActionPlan,
    picId, setPicId,
    deadline, setDeadline,
    findings,
    pics,
    loadingOptions,
    findingsError,
    refreshFindings,
    titleError,
    descriptionError,
    actionPlanError,
    submitError,
    submitting,
    handleSubmit,
  };
}
