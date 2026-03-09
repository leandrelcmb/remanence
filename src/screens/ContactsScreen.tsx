import { useState, useEffect, useCallback, useRef } from "react";
import type { FestivalContact } from "../core/models/types";
import { createContact, listFestivalContacts, removeFestivalContact } from "../core/store/service";
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

// ── Sous-composant : carte contact ────────────────────────────────────────────

function ContactCard({
  contact,
  onDelete,
}: {
  contact: FestivalContact;
  onDelete: () => void;
}) {
  const [showDetail, setShowDetail] = useState(false);
  const initial = contact.name.charAt(0).toUpperCase();

  return (
    <>
      <button
        onClick={() => setShowDetail(true)}
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
              width: 52,
              height: 52,
              borderRadius: "50%",
              objectFit: "cover",
              flexShrink: 0,
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          />
        ) : (
          <div style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "rgba(160,120,255,0.22)",
            border: "1px solid rgba(160,120,255,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            fontWeight: 600,
            flexShrink: 0,
            color: "rgba(200,170,255,0.9)",
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

      {/* Modal détail */}
      {showDetail && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.82)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}>
          <div style={{
            background: "rgba(20,12,36,0.97)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 24,
            padding: 28,
            width: "100%",
            maxWidth: 380,
            display: "grid",
            gap: 20,
          }}>
            {/* Photo pleine */}
            {contact.photo && (
              <img
                src={contact.photo}
                alt={contact.name}
                style={{ width: "100%", borderRadius: 16, objectFit: "cover", maxHeight: 260 }}
              />
            )}

            <div style={{ fontSize: 24, fontWeight: 600 }}>{contact.name}</div>

            {contact.note && (
              <div style={{ fontSize: 15, opacity: 0.7, lineHeight: 1.5 }}>{contact.note}</div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <RoundButton variant="secondary" onClick={() => setShowDetail(false)}>
                  Fermer
                </RoundButton>
              </div>
              <button
                onClick={() => { onDelete(); setShowDetail(false); }}
                style={{
                  flex: 1,
                  borderRadius: 999,
                  padding: "18px 20px",
                  border: "1px solid rgba(255,60,60,0.35)",
                  background: "rgba(255,60,60,0.1)",
                  color: "rgba(255,120,120,0.9)",
                  cursor: "pointer",
                  fontSize: 16,
                  fontFamily: "inherit",
                }}
              >
                Supprimer 🗑️
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

export function ContactsScreen({ festivalId, festivalName, onBack }: Props) {
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

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((f) => ({ ...f, photo: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: "grid", gap: 0, minHeight: "100dvh" }}>

      {/* ── Header sticky — reste visible quel que soit le scroll ── */}
      <div style={{
        padding: "40px 12px 18px",
        display: "grid",
        gap: 14,
        position: "sticky",
        top: 0,
        zIndex: 10,
        backdropFilter: "blur(20px)",
        background: "rgba(0,0,0,0.6)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 26, fontWeight: 500 }}>Rencontres 🤝</h2>
            <div style={{ fontSize: 13, opacity: 0.45, marginTop: 4 }}>
              {festivalName} · {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
            </div>
          </div>
          <button
            onClick={onBack}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 999,
              padding: "8px 16px",
              color: "rgba(255,255,255,0.7)",
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            ↪️ Retour
          </button>
        </div>

        {/* Bouton ajouter — compact, même style que RoundButton mais moins haut */}
        <button
          onClick={() => setShowForm(true)}
          style={{
            width: "100%",
            borderRadius: 999,
            padding: "10px 20px",
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.12)",
            color: "white",
            cursor: "pointer",
            fontSize: 15,
            fontFamily: "inherit",
            letterSpacing: "0.03em",
          }}
        >
          + Ajouter une rencontre
        </button>
      </div>

      {/* ── Liste ── */}
      <div style={{ padding: "0 12px 40px", display: "grid", gap: 10 }}>
        {contacts.length === 0 && (
          <p style={{ opacity: 0.5, fontSize: 15, marginTop: 12 }}>
            Personne encore. Capture tes rencontres de festival ici 🌿
          </p>
        )}

        {contacts.map((c) => (
          <ContactCard key={c.id} contact={c} onDelete={() => handleDelete(c.id)} />
        ))}
      </div>

      {/* ── Formulaire ajout (modal) ── */}
      {showForm && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.85)",
          zIndex: 100,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
        }}>
          <div style={{
            background: "rgba(14,8,28,0.98)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "24px 24px 0 0",
            padding: "28px 20px 40px",
            width: "100%",
            maxWidth: 430,
            display: "grid",
            gap: 18,
          }}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 500 }}>Nouvelle rencontre</h3>

            {/* Photo */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                style={{ display: "none" }}
              />
              {form.photo ? (
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={form.photo}
                    alt="aperçu"
                    style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.3)" }}
                  />
                  <button
                    onClick={() => setForm((f) => ({ ...f, photo: undefined }))}
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      background: "rgba(30,10,50,0.9)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "50%",
                      width: 22,
                      height: 22,
                      fontSize: 12,
                      cursor: "pointer",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "inherit",
                    }}
                  >✕</button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px dashed rgba(255,255,255,0.2)",
                    borderRadius: 16,
                    padding: "14px 20px",
                    color: "rgba(255,255,255,0.55)",
                    fontSize: 14,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    width: "100%",
                  }}
                >
                  📷 Prendre une photo (optionnel)
                </button>
              )}
            </div>

            {/* Nom */}
            <input
              type="text"
              placeholder="Prénom ou @"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 14,
                padding: "14px 16px",
                fontSize: 16,
                color: "white",
                fontFamily: "inherit",
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
              }}
            />

            {/* Note */}
            <textarea
              placeholder="Une particularité, un moment partagé… (optionnel)"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              rows={3}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 14,
                padding: "14px 16px",
                fontSize: 15,
                color: "white",
                fontFamily: "inherit",
                outline: "none",
                resize: "none",
                width: "100%",
                boxSizing: "border-box",
              }}
            />

            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <RoundButton variant="secondary" onClick={() => { setShowForm(false); setForm({ name: "", note: "", photo: undefined }); }}>
                  Annuler
                </RoundButton>
              </div>
              <div style={{ flex: 1 }}>
                <RoundButton variant="primary" onClick={handleSave} disabled={!form.name.trim() || saving}>
                  {saving ? "Enregistrement…" : "Ancrer 🌿"}
                </RoundButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
