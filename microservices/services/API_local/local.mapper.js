const normalizeContractType = (type) => {
      if (!type) return null;
      const t = String(type).toLowerCase().trim();
      if (t.includes('stage') || t.includes('intern')) return 'stage';
      if (t.includes('alternance') || t.includes('apprentissage')) return 'alternance';
      if (t === 'cdi' || t.includes('cdi')) return 'CDI';
      if (t === 'cdd' || t.includes('cdd') || t.includes('contract')) return 'CDD';
      return 'Autres';
};

const normalizeLevel = (experience) => {
      if (!experience || isNaN(experience)) return null;
      const exp = parseInt(experience);
      if (exp <= 2) return 'débutant';
      if (exp <= 5) return 'confirmé';
      return 'senior';
};

const normalizeRemote = (teletravail) => {
      if (!teletravail) return false;
      const t = String(teletravail).toLowerCase().trim();
      return t.includes('hybride') || t.includes('remote') || t.includes('télétravail') || t === 'full remote';
};

const extractDescription = (offre) => {
      // Priorité: description, puis secteur + formation
      if (offre.description?.trim()) return offre.description.trim();

      let parts = [];
      if (offre.entreprise?.secteur) parts.push(`Secteur: ${offre.entreprise.secteur}`);
      if (offre.profil?.formation) parts.push(`Formation: ${offre.profil.formation}`);

      return parts.length > 0 ? parts.join('\n') : '';
};

const extractSalaryInKEuro = (salary) => {
      // Convertir de EUR annuel à k€ mensuel ou annuel selon la valeur
      if (!salary) return null;
      const val = parseInt(salary);
      if (isNaN(val)) return null;
      // Si > 1000, c'est un salaire annuel, diviser par 1000
      if (val > 1000) return Math.round(val / 1000);
      return val;
};

export function mapLocalJob(offre) {
      // Validation stricte: nom d'entreprise obligatoire
      const companyName = offre.entreprise?.nom?.trim();
      if (!companyName) {
            console.debug(`Offre ${offre.id} rejetée: pas de nom d'entreprise`);
            return null;
      }

      // Validation: titre obligatoire
      const title = offre.titre?.trim();
      if (!title) {
            console.debug(`Offre ${offre.id} rejetée: pas de titre`);
            return null;
      }

      return {
            externalId: `local-${offre.id}`,
            title,
            company: companyName,
            location: offre.localisation?.ville?.trim() || null,
            description: extractDescription(offre),
            salary_min: extractSalaryInKEuro(offre.salaire?.min),
            salary_max: extractSalaryInKEuro(offre.salaire?.max),
            contract_type: normalizeContractType(offre.type_contrat),
            remote: normalizeRemote(offre.localisation?.teletravail),
            level: normalizeLevel(offre.profil?.experience_annees),
            source_url: offre.entreprise?.site_web?.trim() || null,
            source: 'local',
      };
}