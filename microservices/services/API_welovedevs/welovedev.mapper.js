import sanitizeHtml from 'sanitize-html';

const sanitizeText = (str) => sanitizeHtml(str ?? '', { allowedTags: [], allowedAttributes: {} });
const sanitizeDescription = (str) => sanitizeHtml(str ?? '', {
  allowedTags: ['p', 'br', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i'],
  allowedAttributes: {},
});

export function mapJob(job) {
  // Rejeter les offres sans nom d'entreprise valide
  const companyName = job.smallCompany?.companyName?.trim() || job.company?.name?.trim();
  if (!companyName) {
    return null;
  }

  return {
    externalId: job.id ?? job.objectID,
    title: sanitizeText(job.title?.trim() || null),
    company: sanitizeText(companyName),
    location: sanitizeText(job.formattedPlaces?.[0] || null),
    description: sanitizeDescription(job.description ?? job.descriptionPreview),
    salary_min: job.details?.salary?.min || null,
    salary_max: job.details?.salary?.max || null,
    contract_type: job.details?.contracts ? normalizeContractType(job.details.contracts) : null,
    remote: job.details?.remotePolicy?.frequency === 'fullTime' || job.details?.remotePolicy?.frequency === 'remote' || false,
    remote_policy: job.details?.remotePolicy?.frequency || null,
    skills: job.skillsList?.map(s => s.name).filter(Boolean) ?? [],
    level: job.details?.requiredExperience ? normalizeLevel(job.details.requiredExperience) : null,
    source_url: job.seoAlias ? `https://welovedevs.com/app/jobs/${job.seoAlias}` : null,
    source: 'welovedevs',
    published_at: job.publishDate ? new Date(job.publishDate / 1000) : new Date(),
  };
}

const normalizeContractType = (contracts) => {
  if (!contracts) return null;

  // contracts can be an object { permanent: true } or an array ['permanent'] or a string
  let keys = [];
  if (Array.isArray(contracts)) {
    keys = contracts.map(String);
  } else if (typeof contracts === 'string') {
    keys = [contracts];
  } else if (typeof contracts === 'object') {
    keys = Object.keys(contracts).filter((k) => contracts[k]);
  }

  if (keys.some(k => k === 'internship' || k === 'stage')) return 'stage';
  if (keys.some(k => k === 'apprenticeship' || k === 'alternance')) return 'alternance';
  if (keys.some(k => k === 'permanent' || k === 'CDI')) return 'CDI';
  if (keys.some(k => k === 'temporary' || k === 'CDD' || k === 'contract')) return 'CDD';

  // Database expects French 'Autres' for unknown/other contract types
  return 'Autres';
};

const normalizeLevel = (experience) => {
  if (!experience) return null;
  if (experience <= 2) return 'débutant';
  if (experience <= 5) return 'confirmé';
  return 'senior';
};