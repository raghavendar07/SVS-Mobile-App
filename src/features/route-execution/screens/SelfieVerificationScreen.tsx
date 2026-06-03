import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Screen, Button } from '@shared/components';
import { paths } from '@routes/routePaths';
import { useSaveVerification } from '../hooks/useVerification';

/**
 * Gate 2: pre-trip driver selfie. Front camera via input[type=file capture=user]
 * — works offline, no getUserMedia permission dance. Blob persists in IndexedDB,
 * metadata enqueues for sync. On confirm → odometer/start.
 */
export function SelfieVerificationScreen() {
  const { routeId = '' } = useParams();
  const navigate = useNavigate();
  const save = useSaveVerification(routeId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Free the blob URL when the preview changes / unmounts.
  useEffect(() => {
    if (!blob) {
      setPreviewUrl(null);
      return;
    }
    const u = URL.createObjectURL(blob);
    setPreviewUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setBlob(f);
  }

  function retake() {
    setBlob(null);
    inputRef.current?.click();
  }

  function confirm() {
    if (!blob) return;
    save.mutate(
      { blob },
      {
        onSuccess: () => navigate(paths.executeStart(routeId), { replace: true }),
      },
    );
  }

  return (
    <Screen
      header={
        <div className="flex min-h-touch items-center gap-2 px-2">
          <button
            onClick={() => navigate(-1)}
            className="flex h-touch min-w-touch items-center justify-center rounded-xl text-brand-accent active:bg-slate-100"
            aria-label="Back"
          >
            ‹ Back
          </button>
          <h1 className="text-xl font-bold text-slate-900">Verify identity</h1>
        </div>
      }
      footer={
        <div className="space-y-2 p-4">
          {blob ? (
            <>
              <Button fullWidth disabled={save.isPending} onClick={confirm}>
                {save.isPending ? 'Saving…' : 'Use photo'}
              </Button>
              <Button fullWidth variant="secondary" onClick={retake}>
                Retake
              </Button>
            </>
          ) : (
            <Button fullWidth onClick={() => inputRef.current?.click()}>
              Take selfie
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-5 p-6">
        <p className="text-sm text-slate-600">
          A quick selfie verifies you're the assigned driver. Held locally on this device, syncs when back online.
        </p>

        <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50">
          {previewUrl ? (
            <img src={previewUrl} alt="Driver selfie preview" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm text-slate-400">No photo yet</span>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={onPick}
          className="hidden"
        />
      </div>
    </Screen>
  );
}
