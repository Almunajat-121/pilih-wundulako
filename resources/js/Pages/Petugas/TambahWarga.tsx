import React, { useRef, useState, useCallback } from 'react';
import { Link, useForm } from '@inertiajs/react';
import PetugasLayout from '@/Layouts/PetugasLayout';
import { Rt } from '@/types';
import LoadingButton from '@/Components/LoadingButton';
import { useIsMobile } from '@/lib/useIsMobile';

export default function TambahWarga({ rt }: { rt: Rt }) {
    const isMobile = useIsMobile();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
    const [cameraActive, setCameraActive] = useState(false);
    
    const { data, setData, post, processing, errors } = useForm({
        nama: '',
        alamat: '',
        foto_ktp: null as File | null,
    });

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setCameraActive(true);
            setPhotoDataUrl(null);
        } catch (err) {
            alert('Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.');
            console.error("Camera access error:", err);
        }
    };

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setCameraActive(false);
    }, [stream]);

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                setPhotoDataUrl(dataUrl);
                
                // Convert dataUrl to File object for form submission
                fetch(dataUrl)
                    .then(res => res.blob())
                    .then(blob => {
                        const file = new File([blob], "ktp-capture.jpg", { type: "image/jpeg" });
                        setData('foto_ktp', file);
                    });
                
                stopCamera();
            }
        }
    };

    // Stop camera if user leaves page
    React.useEffect(() => {
        return () => stopCamera();
    }, [stopCamera]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/petugas/wilayah/${rt.id}/warga`);
    };

    const header = isMobile ? (
        <header className="m-header-plain">
            <Link href={`/petugas/wilayah/${rt.id}`} className="back-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </Link>
            <div>
                <h2 className="m-header-title">Tambah Warga Baru</h2>
                <p className="m-sub">Pendataan offline</p>
            </div>
        </header>
    ) : (
        <header className="topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link href={`/petugas/wilayah/${rt.id}`} className="btn-link" style={{ color: 'var(--text-soft)' }}>&larr; Batal</Link>
                <div>
                    <h2 className="page-title">Tambah Warga Baru</h2>
                    <p className="page-sub">Pendataan pemilih offline</p>
                </div>
            </div>
        </header>
    );

    const content = (
        <>
            <div className="section-block">
                <div className="callout callout-brass" style={{ marginTop: 0 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>
                    <span>Hanya gunakan form ini jika warga tidak terdaftar dalam DPT namun memiliki identitas desa ini. Foto KTP/KK wajib dilampirkan.</span>
                </div>
            </div>

            <div className="section-block">
                <h2 className="section-h">Data warga</h2>
                <div className="field-grid">
                    <div>
                        <label className="field-label">Nama lengkap (sesuai identitas)</label>
                        <input 
                            type="text" 
                            className="w-full border-gray-300 rounded-md shadow-sm" 
                            placeholder="Nama lengkap..." 
                            value={data.nama}
                            onChange={e => setData('nama', e.target.value)}
                            required
                        />
                        {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama}</p>}
                    </div>
                    <div>
                        <label className="field-label">Alamat / Keterangan</label>
                        <input 
                            type="text" 
                            className="w-full border-gray-300 rounded-md shadow-sm" 
                            placeholder="Detail alamat..." 
                            value={data.alamat}
                            onChange={e => setData('alamat', e.target.value)}
                            required
                        />
                        {errors.alamat && <p className="text-red-500 text-xs mt-1">{errors.alamat}</p>}
                    </div>
                    <div className="field-full" style={{ maxWidth: '340px' }}>
                        <label className="field-label">Wilayah</label>
                        <input 
                            type="text" 
                            className="w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500" 
                            value={`${rt.nama} / ${rt.rw?.nama}`} 
                            disabled 
                        />
                    </div>
                </div>
            </div>

            <div className="section-block">
                <h2 className="section-h">Foto Identitas (KTP/KK) asli</h2>
                
                {!cameraActive && !photoDataUrl && (
                    <div className="upload-zone" onClick={startCamera}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8a2 2 0 0 1 2-2h1.2a1 1 0 0 0 .9-.55l.6-1.2A1 1 0 0 1 9.6 3.7h4.8a1 1 0 0 1 .9.55l.6 1.2a1 1 0 0 0 .9.55H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z"/><circle cx="12" cy="13" r="3.4"/></svg>
                        <strong>Ambil foto langsung dari kamera</strong>
                        <small>Wajib dari kamera perangkat saat ini &mdash; unggah dari galeri tidak diperbolehkan</small>
                    </div>
                )}
                
                {cameraActive && (
                    <div className="rounded-xl overflow-hidden bg-black relative aspect-[4/3] w-full max-w-[400px] mx-auto shadow-inner">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                            <button type="button" onClick={capturePhoto} className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                                <div className="w-12 h-12 border border-gray-400 rounded-full"></div>
                            </button>
                        </div>
                    </div>
                )}
                
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                
                {photoDataUrl && (
                    <div className="rounded-xl overflow-hidden border border-gray-200 relative aspect-[4/3] w-full max-w-[400px] mx-auto shadow-sm">
                        <img src={photoDataUrl} alt="Captured KTP" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <button type="button" onClick={startCamera} className="bg-white text-gray-800 font-medium px-4 py-2 rounded-full shadow-lg text-sm flex items-center gap-2">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.13 15.57a9 9 0 1 0 3.84-10.36L2 8M2.5 22v-6h6M21.87 8.43a9 9 0 1 0-3.84 10.36L22 16"/></svg>
                                Retake Foto
                            </button>
                        </div>
                    </div>
                )}
                {errors.foto_ktp && <p className="text-red-500 text-xs mt-3 text-center">{errors.foto_ktp}</p>}
            </div>
        </>
    );

    return (
        <PetugasLayout title="Tambah Warga Baru" customHeader={header}>
            <form onSubmit={submit} className="flex flex-col h-full relative">
                {isMobile ? (
                    <div className="flex flex-col gap-6 pt-2 pb-24" style={{ padding: '0 18px' }}>
                        {content}
                    </div>
                ) : (
                    <div className="content-narrow w-full" style={{ paddingBottom: '100px', paddingTop: '20px' }}>
                        <div className="card">
                            {content}
                        </div>
                    </div>
                )}

                <div className={isMobile ? "fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-40 max-w-[480px] mx-auto" : "sticky-footer"} style={!isMobile ? { maxWidth: '760px', margin: '0 auto' } : {}}>
                    <LoadingButton 
                        processing={processing}
                        type="submit" 
                        className="btn-block"
                        disabled={!data.nama || !data.alamat || !data.foto_ktp}
                    >
                        Simpan &amp; Lanjutkan ke Voting
                    </LoadingButton>
                </div>
            </form>
        </PetugasLayout>
    );
}
