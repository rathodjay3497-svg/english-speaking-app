interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Remove all',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: '20px 18px',
          width: '100%',
          maxWidth: 280,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center', fontSize: 28, marginBottom: 8 }}>🗑️</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', textAlign: 'center', marginBottom: 6 }}>
          {title}
        </div>
        <div style={{ fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 16, lineHeight: 1.5 }}>
          {message}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: '#f0e8de', color: '#555', fontSize: 12, fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: '#e05c2e', color: '#fff', fontSize: 12, fontWeight: 600,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
