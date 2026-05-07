export function mapJob(job) {
  // Rejeter les offres sans nom d'entreprise valide
  const companyName = job.smallCompany?.companyName?.trim() || job.company?.name?.trim();
  if (!companyName) {
    return null;
  }

  return {
    externalId: job.id ?? job.objectID,
    title: job.title?.trim() || null,
    company: companyName,
    location: job.formattedPlaces?.[0] || null,
    description: job.descriptionPreview || '',
    salary_min: job.details?.salary?.min || null,
    salary_max: job.details?.salary?.max || null,
    contract_type: job.details?.contracts ? normalizeContractType(job.details.contracts) : 'other',
    remote: job.details?.remotePolicy?.frequency === 'fullTime' || false,
    level: job.details?.requiredExperience ? normalizeLevel(job.details.requiredExperience) : null,
    source_url: job.seoAlias ? `https://welovedevs.com/app/jobs/${job.seoAlias}` : null,
    source: 'welovedevs',
    published_at: job.publishDate ? new Date(job.publishDate / 1000) : new Date(),
  };
}

const normalizeContractType = (contracts) => {
  if (!contracts) return 'other';
  const keys = Object.keys(contracts).filter(k => contracts[k]);
  if (keys.includes('internship')) return 'stage';
  if (keys.includes('apprenticeship')) return 'alternance';
  if (keys.includes('permanent')) return 'CDI';
  if (keys.includes('temporary')) return 'CDD';
  return 'other';
};

const normalizeLevel = (experience) => {
  if (!experience) return null;
  if (experience <= 2) return 'junior';
  if (experience <= 5) return 'mid';
  return 'senior';
};