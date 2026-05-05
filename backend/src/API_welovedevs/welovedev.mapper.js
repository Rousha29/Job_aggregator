export function mapJob(job) {
  return {
    title: job.title?.trim() || null, // enlever les espaces inutiles
    company: job.company?.name || "Unknown", // unknown si pas de nom
    location: job.location || null, 
    salary: job.salary ? parseInt(job.salary) : null, // converti salaire en nombre
    tags: job.tags?.map(t => t.toLowerCase()) || [], // tags en minuscules
    createdAt: new Date(job.published_at), // converti en date
  };
}