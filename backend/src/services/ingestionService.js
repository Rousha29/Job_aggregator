import pool from '../config/db.js';
import sanitizeHtml from 'sanitize-html';

const delay = (ms) => new Promise(r => setTimeout(r, ms));

const fetchFromApi = async (page = 0, size = 50) => {
  const axios = (await import('axios')).default;
  const apiClient = axios.create({
    baseURL: 'https://epi-api.welovedevs.com/v1',
    headers: { 'X-API-Key': process.env.WELOVEDEVS_API_KEY },
    timeout: 15000,
  });
  const maxRetries = 5;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await apiClient.get('', { params: { page, size } });
      return response.data;
    } catch (err) {
      const status = err?.response?.status;
      const retryAfterHeader = err?.response?.headers?.['retry-after'];
      const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) * 1000 : null;
      const isRetryable = status === 429 || status === 502 || status === 503 || status === 504;

      if (!isRetryable || attempt === maxRetries) {
        throw err;
      }

      const backoff = Math.min(1000 * Math.pow(2, attempt), 10000);
      const waitTime = retryAfter && !Number.isNaN(retryAfter)
        ? retryAfter
        : backoff + Math.floor(Math.random() * 250);

      console.warn(`WeLoveDevs rate limited (status ${status}). Retry in ${waitTime}ms...`);
      await delay(waitTime);
    }
  }
};

const normalizeContractType = (contractTypes, contracts) => {
  if (Array.isArray(contractTypes) && contractTypes.length > 0) {
    const t = contractTypes[0].toLowerCase();
    if (t === 'internship' || t === 'stage') return 'stage';
    if (t === 'apprenticeship' || t === 'alternance') return 'alternance';
    if (t === 'permanent' || t === 'cdi') return 'CDI';
    if (t === 'temporary' || t === 'cdd' || t === 'contract') return 'CDD';
    if (t === 'freelance') return 'Autres';
  }

  if (contracts && typeof contracts === 'object') {
    const keys = Object.keys(contracts).filter(k => contracts[k]);
    if (keys.some(k => k === 'internship' || k === 'stage')) return 'stage';
    if (keys.some(k => k === 'apprenticeship' || k === 'alternance')) return 'alternance';
    if (keys.some(k => k === 'permanent' || k === 'CDI')) return 'CDI';
    if (keys.some(k => k === 'temporary' || k === 'CDD' || k === 'contract')) return 'CDD';
    if (keys.some(k => k === 'freelance')) return 'Autres';
  }

  return 'Autres';
};

const normalizeRemotePolicy = (frequency) => {
  if (!frequency) return null;
  const map = {
    'remote': 'remote',
    'fullTime': 'remote',
    'full_time': 'remote',
    'hybrid': 'hybrid',
    'partTime': 'hybrid',
    'part_time': 'hybrid',
    'onsite': 'onsite',
    'office': 'onsite',
    'no': 'onsite',
  };
  return map[frequency] ?? frequency;
};

const mapJob = (job) => {
  const companyName = job.smallCompany?.companyName?.trim()
    || (typeof job.company === 'string' ? job.company.trim() : job.company?.name?.trim());
  if (!companyName) return null;

  const contract_type = normalizeContractType(
    job.contractTypes,
    job.details?.contracts
  );

  const remote_policy = normalizeRemotePolicy(job.details?.remotePolicy?.frequency);
  const skills = job.skillsList?.map(s => s.name).filter(Boolean) ?? [];

  return {
    externalId: job.id ?? job.objectID,
    title: job.title?.trim() || null,
    company: companyName,
    location: job.formattedPlaces?.[0] || null,
    description: job.descriptionPreview ?? job.description ?? '',
    salary_min: job.details?.salary?.min || null,
    salary_max: job.details?.salary?.max || null,
    contract_type,
    remote: remote_policy === 'remote',
    remote_policy,
    skills,
    source_url: job.seoAlias ? `https://welovedevs.com/app/jobs/${job.seoAlias}` : null,
    source: 'welovedevs',
  };
};

export const ingestJobs = async () => {
  let page = 0;
  const size = 50;
  let totalIngested = 0;
  let hasMore = true;

  while (hasMore) {
    console.log(`Fetching page ${page}...`);
    const data = await fetchFromApi(page, size);
    const offers = data.values ?? [];

    if (offers.length === 0) {
      hasMore = false;
      break;
    }

    for (const raw of offers) {
      const o = mapJob(raw);
      if (!o) continue;

      try {
        await pool.query(
          `INSERT INTO offers (external_id, title, description, company, location, contract_type, salary_min, salary_max, remote, remote_policy, skills, source_url, source, fetched_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW())
           ON CONFLICT (external_id, source) DO UPDATE SET
             title=$2, description=$3, company=$4, location=$5, contract_type=$6,
             salary_min=$7, salary_max=$8, remote=$9, remote_policy=$10, skills=$11, source_url=$12`,
          [o.externalId, o.title, o.description, o.company, o.location,
          o.contract_type, o.salary_min, o.salary_max, o.remote,
          o.remote_policy, JSON.stringify(o.skills),
          o.source_url, o.source]
        );
        totalIngested++;
      } catch (err) {
        console.error(`Error inserting offer ${o.externalId}:`, err.message);
      }

      await delay(100);
    }

    console.log(`Page ${page} done — ${totalIngested} offres ingérées au total`);
    page++;

    if (offers.length < size) hasMore = false;
    await delay(1500);
  }

  return { ingested: totalIngested };
};