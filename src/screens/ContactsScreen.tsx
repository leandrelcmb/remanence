import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from 'react-i18next';
import type { FestivalContact } from "../core/models/types";
import {
  createContact,
  listFestivalContacts,
  removeFestivalContact,
  updateFestivalContact,
} from "../core/store/service";
import { RoundButton } from "../app/ui/RoundButton";

type Props = {
  festivalId: string;
  festivalName: string;
  onBack: () => void;
};

type ContactFormState = {
  name: string;
  note: string;
  photo?: string;
};

// ── Sous-composant : carte contact ───────────────────────────────────────────

function ContactCard({
  contact,
  onDelete,
  onUpdate,
}: {
  contact: FestivalContact;
  onDelete: () => void;
  onUpdate: (updated: FestivalContact) => void;
}) {
  const { t } = useTranslation();
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState<ContactFormState>({
    name: contact.name,
    note: contact.note ?? "",
    photo: contact.photo,
  });
  const editFileRef = useRef<HTMLInputElement>(null);
  const initial = contact.name.charAt(0).toUpperCase();

  // Sync si le contact change en dehors
  useEffect(() => {
    setEditForm({ name: contact.name, note: contact.note ?? "", photo: contact.photo });
  }, [contact.name, contact.note, contact.photo]);

  const handleSaveEdit = () => {
    if (!editForm.name.trim()) return;
    onUpdate({ ...contact, name: editForm.name.trim(), note: editForm.note || undefined, photo: editForm.photo });
    setShowEdit(false);
    setShowDetail(false);
  };

  const handleEditPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setEditForm((f) => ({ ...f, photo: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  return (
    <>
      {/* ── Carte cliquable ── */}
      <button
        onClick={() => { setShowEdit(false); setShowDetail(true); }}
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: "14px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          cursor: "pointer",
          color: "white",
          fontFamily: "inherit",
          textAlign: "left",
          width: "100%",
        }}
      >
        {/* Avatar */}
        {contact.photo ? (
          <img
            src={contact.photo}
            alt={contact.name}
            style={{
              width: 52, height: 52, borderRadius: "50%", objectFit: "cover",
              flexShrink: 0, border: "1px solid rgba(255,255,255,0.18)",
            }}
          />
        ) : (
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "rgba(160,120,255,0.22)", border: "1px solid rgba(160,120,255,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 600, flexShrink: 0, color: "rgba(200,170,255,0.9)",
          }}>
            {initial}
          </div>
        )}
        {/* Infos */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 500 }}>{contact.name}</div>
          {contact.note && (
            <div style={{ fontSize: 13, opacity: 0.55, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {contact.note}
            </div>
          )}
        </div>
      </button>

      {/* ── Modal détail/édition — via createPortal → couvre tout l'écran ── */}
      {showDetail && createPortal(
        <div
          onClick={(e) => { if (e.target === e.currentTarget) { setShowDetail(false); setShowEdit(false); } }}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.88)",
            zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
          }}
        >
          <div style={{
            background: "rgba(20,12,36,0.97)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 24, padding: 28, width: "100%", maxWidth: 380,
            display: "grid", gap: 20,
          }}>

            {!showEdit ? (
              /* ── Mode affichage ── */
              <>
                {contact.photo && (
                  <img src={contact.photo} alt={contact.name}
                    style={{ width: "100%", borderRadius: 16, objectFit: "cover", maxHeight: 260 }} />
                )}
                <div style={{ fontSize: 24, fontWeight: 600 }}>{contact.name}</div>
                {contact.note && (
                  <div style={{ fontSize: 16, opacity: 0.7, lineHeight: 1.5 }}>{contact.note}</div>
                )}

                {/* Boutons : [Fermer] [Modifier] [🗑️] */}
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <RoundButton variant="secondary" onClick={() => setShowDetail(false)}>
                      {t('contacts.close')}
                    </RoundButton>
                  </div>
                  <div style={{ flex: 1 }}>
                    <RoundButton variant="primary" onClick={() => setShowEdit(true)}>
                      {t('contacts.edit')}
                    </RoundButton>
                  </div>
                  {/* Bouton poubelle compact */}
                  <button
                    onClick={() => { onDelete(); setShowDetail(false); }}
                    title="Supprimer ce contact"
                    style={{
                      flexShrink: 0,
                      width: 44, height: 44,
                      borderRadius: "50%",
                      border: "1px solid rgba(255,60,60,0.35)",
                      background: "rgba(255,60,60,0.10)",
                      color: "rgba(255,120,120,0.9)",
                      cursor: "pointer",
                      fontSize: 18,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "inherit",
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </>
            ) : (
              /* ── Mode édition ── */
              <>
                <h3 style={{ margin: 0, fontSize: 19, fontWeight: 500 }}>{t('contacts.editTitle')}</h3>

                {/* Photo */}
                <div>
                  <input
                    ref={editFileRef}
                    type="file" accept="image/*" capture="environment"
                    onChange={handleEditPhoto}
                    style={{ display: "none" }}
                  />
                  {editForm.photo ? (
                    <div style={{ position: "relative", display: "inline-block" }}>
                      <img src={editForm.photo} alt="aperçu"
                        style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.3)" }} />
                      <button
                        onClick={() => setEditForm((f) => ({ ...f, photo: undefined }))}
                        style={{
                          position: "absolute", top: -4, right: -4,
                          background: "rgba(30,10,50,0.9)", border: "1px solid rgba(255,255,255,0.2)",
                          borderRadius: "50%", width: 22, height: 22, fontSize: 12,
                          cursor: "pointer", color: "white",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "inherit",
                        }}
                      >✕</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => editFileRef.current?.click()}
                      style={{
                        background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.2)",
                        borderRadius: 16, padding: "12px 20px",
                        color: "rgba(255,255,255,0.55)", fontSize: 14,
                        cursor: "pointer", fontFamily: "inherit", width: "100%",
                      }}
                    >
                      {t('contacts.changePhoto')}
                    </button>
                  )}
                </div>

                {/* Nom */}
                <input
                  type="text" placeholder={t('contacts.namePlaceholder')}
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  style={{
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)",
                    borderRadius: 14, padding: "14px 16px", fontSize: 16,
                    color: "white", fontFamily: "inherit", outline: "none",
                    width: "100%", boxSizing: "border-box",
                  }}
                />

                {/* Note */}
                <textarea
                  placeholder={t('contacts.notePlaceholder')}
                  value={editForm.note}
                  onChange={(e) => setEditForm((f) => ({ ...f, note: e.target.value }))}
                  rows={3}
                  style={{
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)",
                    borderRadius: 14, padding: "14px 16px", fontSize: 16,
                    color: "white", fontFamily: "inherit", outline: "none",
                    resize: "none", width: "100%", boxSizing: "border-box",
                  }}
                />

                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <RoundButton variant="secondary" onClick={() => setShowEdit(false)}>
                      {t('contacts.cancel')}
                    </RoundButton>
                  </div>
                  <div style={{ flex: 1 }}>
                    <RoundButton variant="primary" onClick={handleSaveEdit} disabled={!editForm.name.trim()}>
                      {t('contacts.save')}
                    </RoundButton>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

export function ContactsScreen({ festivalId, festivalName, onBack }: Props) {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState<FestivalContact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ContactFormState>({ name: "", note: "", photo: undefined });
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reload = useCallback(async () => {
    const list = await listFestivalContacts(festivalId);
    setContacts(list);
  }, [festivalId]);

  useEffect(() => { reload(); }, [reload]);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await createContact({ festivalId, name: form.name, note: form.note || undefined, photo: form.photo });
      setForm({ name: "", note: "", photo: undefined });
      setShowForm(false);
      await reload();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await removeFestivalContact(id);
    await reload();
  };

  const handleUpdate = async (updated: FestivalContact) => {
    await updateFestivalContact(updated);
    await reload();
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm((f) => ({ ...f, photo: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  return (
    /* Layout flex colonne — header fixe, liste scrollable */
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* ── Header fixe ── */}
      <div style={{
        flexShrink: 0,
        padding: "20px 16px 14px",
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(22px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "grid",
        gap: 12,
      }}>
        {/* Titre + bouton retour */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 26, fontWeight: 500 }}>{t('contacts.title')}</h2>
            <div style={{ fontSize: 13, opacity: 0.45, marginTop: 4 }}>
              {festivalName} · {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
            </div>
          </div>
          <button
            onClick={onBack}
            style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 999, padding: "8px 16px",
              color: "rgba(255,255,255,0.7)", fontSize: 16,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {t('common.home')}
          </button>
        </div>

        {/* Bouton ajouter */}
        <button
          onClick={() => setShowForm(true)}
          style={{
            width: "auto", alignSelf: "start",
            borderRadius: 999, padding: "7px 16px",
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(255,255,255,0.10)",
            color: "rgba(255,255,255,0.9)",
            cursor: "pointer", fontSize: 13,
            fontFamily: "inherit", letterSpacing: "0.04em",
          }}
        >
          {t('contacts.add')}
        </button>
      </div>

      {/* ── Liste scrollable ── */}
      <div className="no-scrollbar" style={{
        flex: 1, overflowY: "auto", padding: "12px 12px 40px",
        display: "flex", flexDirection: "column", gap: 10,
      }}>
        {contacts.length === 0 && (
          <p style={{ opacity: 0.5, fontSize: 16, marginTop: 12 }}>
            {t('contacts.empty')}
          </p>
        )}
        {contacts.map((c) => (
          <ContactCard
            key={c.id}
            contact={c}
            onDelete={() => handleDelete(c.id)}
            onUpdate={handleUpdate}
          />
        ))}
      </div>

      {/* ── Formulaire ajout (modal via portal → couvre tout l'écran) ── */}
      {showForm && createPortal(
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.88)",
          zIndex: 1000,
          display: "flex", alignItems: "flex-end", justifyContent: "center",
        }}>
          <div style={{
            background: "rgba(14,8,28,0.98)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "24px 24px 0 0", padding: "28px 20px 40px",
            width: "100%", maxWidth: 430, display: "grid", gap: 25,
          }}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 500 }}>{t('contacts.newTitle')}</h3>

            {/* Photo */}
            <div>
              <input
                ref={fileInputRef}
                type="file" accept="image/*" capture="environment"
                onChange={handlePhotoCapture}
                style={{ display: "none" }}
              />
              {form.photo ? (
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img src={form.photo} alt="aperçu"
                    style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.3)" }} />
                  <button
                    onClick={() => setForm((f) => ({ ...f, photo: undefined }))}
                    style={{
                      position: "absolute", top: -4, right: -4,
                      background: "rgba(30,10,50,0.9)", border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "50%", width: 22, height: 22, fontSize: 12,
                      cursor: "pointer", color: "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "inherit",
                    }}
                  >✕</button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.2)",
                    borderRadius: 16, padding: "14px 20px",
                    color: "rgba(255,255,255,0.55)", fontSize: 14,
                    cursor: "pointer", fontFamily: "inherit", width: "100%",
                  }}
                >
                  {t('contacts.addPhoto')}
                </button>
              )}
            </div>

            {/* Nom */}
            <input
              type="text" placeholder={t('contacts.namePlaceholder')}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 14, padding: "14px 16px", fontSize: 16,
                color: "white", fontFamily: "inherit", outline: "none",
                width: "100%", boxSizing: "border-box",
              }}
            />

            {/* Note */}
            <textarea
              placeholder={t('contacts.notePlaceholder')}
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              rows={3}
              style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 14, padding: "14px 16px", fontSize: 16,
                color: "white", fontFamily: "inherit", outline: "none",
                resize: "none", width: "100%", boxSizing: "border-box",
              }}
            />

            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <RoundButton variant="secondary" onClick={() => { setShowForm(false); setForm({ name: "", note: "", photo: undefined }); }}>
                  {t('contacts.cancel')}
                </RoundButton>
              </div>
              <div style={{ flex: 1 }}>
                <RoundButton variant="primary" onClick={handleSave} disabled={!form.name.trim() || saving}>
                  {saving ? "Enregistrement…" : t('contacts.anchor')}
                </RoundButton>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
