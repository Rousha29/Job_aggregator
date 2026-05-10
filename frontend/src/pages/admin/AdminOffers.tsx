import { useEffect, useState } from 'react';
import { getOffers, updateOffer, deleteOffer } from '../../services/adminService';
import BurgerMenu from '../../components/BurgerMenu/BurgerMenu';
import './admin.css';

type Offer = {
  id: string;
  title: string;
  company: string;
  contract_type: string;
  fetched_at: string;
  is_visible: boolean;
  source: string;
};

type OfferDraft = {
  title: string;
  company: string;
  contract_type: string;
  is_visible: boolean;
};

function AdminOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<OfferDraft | null>(null);

  const load = () => getOffers().then(res => setOffers(res.data));

  useEffect(() => { load(); }, []);

  const startEdit = (offer: Offer) => {
    setEditingId(offer.id);
    setDraft({
      title: offer.title,
      company: offer.company ?? '',
      contract_type: offer.contract_type ?? '',
      is_visible: offer.is_visible,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const saveEdit = async (id: string) => {
    if (!draft) return;

    await updateOffer(id, {
      title: draft.title.trim(),
      company: draft.company.trim(),
      contract_type: draft.contract_type,
      is_visible: draft.is_visible,
    });

    cancelEdit();
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette offre ?')) return;
    await deleteOffer(id);
    load();
  };

  return (
    <div className="admin-layout">
      <BurgerMenu isAdmin={true} />
      <main className="admin-main">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Intitulé de poste</th>
              <th>Entreprise</th>
              <th>Source</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.map(offer => (
              <tr key={offer.id}>
                <td>
                  {editingId === offer.id && draft ? (
                    <input
                      className="admin-input"
                      value={draft.title}
                      onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    />
                  ) : (
                    offer.title
                  )}
                </td>
                <td>
                  {editingId === offer.id && draft ? (
                    <input
                      className="admin-input"
                      value={draft.company}
                      onChange={(e) => setDraft({ ...draft, company: e.target.value })}
                    />
                  ) : (
                    offer.company
                  )}
                </td>
                <td>{offer.source}</td>
                <td>{new Date(offer.fetched_at).toLocaleDateString('fr-FR')}</td>
                <td>
                  {editingId === offer.id && draft ? (
                    <select
                      className="admin-select"
                      value={draft.is_visible ? 'visible' : 'hidden'}
                      onChange={(e) => setDraft({ ...draft, is_visible: e.target.value === 'visible' })}
                    >
                      <option value="visible">Visible</option>
                      <option value="hidden">Masquée</option>
                    </select>
                  ) : (
                    offer.is_visible ? 'Visible' : 'Masquée'
                  )}
                </td>
                <td>
                  {editingId === offer.id ? (
                    <>
                      <button
                        className="btn-edit"
                        onClick={() => saveEdit(offer.id)}
                      >
                        Modifier
                      </button>
                      <button
                        className="btn-edit"
                        onClick={cancelEdit}
                      >
                        Annuler
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn-edit"
                      onClick={() => startEdit(offer)}
                    >
                      Modifier
                    </button>
                  )}
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(offer.id)}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}

export default AdminOffers;