import React, { useRef, useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import PetugasLayout from '@/Layouts/PetugasLayout';
import { Rt } from '@/types';

export default function TambahWarga({ rt }: { rt: Rt }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        nama: '',
        alamat: '',
        foto: null as File | null,
    });

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                setCameraActive(true);
                setPhotoPreview(null);
            }
        } catch (err) {
            alert('Tidak dapat mengakses kamera. Pastikan Anda memberikan izin akses kamera.');
            console.error(err);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            setCameraActive(false);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], "ktp.jpg", { type: "image/jpeg" });
                        setData('foto', file);
                        setPhotoPreview(URL.createObjectURL(blob));
                        stopCamera();
                    }
                }, 'image/jpeg', 0.8);
            }
        }
    };

    const retake = () => {
        setPhotoPreview(null);
        setData('foto', null);
        startCamera();
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/petugas/wilayah/${rt.id}/warga`);
    };

    React.useEffect(() => {
        return () => stopCamera();
    }, []);

    const header = (
        <header className="m-header">
            <Link href={`/petugas/wilayah/${rt.id}`} className="m-back">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </Link>
            <div>
                <p className="m-title">Tambah Warga Baru</p>
                <p className="m-sub">Bukan DPT / tambahan</p>
            </div>
        </header>
    );

    return (
        <PetugasLayout title="Tambah Warga Baru" customHeader={header}>
            <div className="flex flex-col gap-4 pt-2 pb-24">
                <div className="callout callout-brass">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>
                    <span>Hanya gunakan form ini jika warga tidak terdaftar dalam DPT namun memiliki KTP desa ini. Foto KTP wajib dilampirkan.</span>
                </div>

                <form id="tambah-warga-form" onSubmit={submit} className="flex flex-col gap-4">
                    <div className="field-group">
                        <div>
                            <label className="field-label">Nama lengkap (sesuai KTP)</label>
                            <input 
                                type="text" 
                                className="m-input" 
                                placeholder="Nama lengkap"
                                value={data.nama}
                                onChange={e => setData('nama', e.target.value)}
                                required
                            />
                            {errors.nama && <p className="mt-1 text-[11px] text-red-600 font-semibold">{errors.nama}</p>}
                        </div>
                        <div>
                            <label className="field-label">Alamat domisili saat ini</label>
                            <input 
                                type="text" 
                                className="m-input" 
                                placeholder="Alamat lengkap"
                                value={data.alamat}
                                onChange={e => setData('alamat', e.target.value)}
                                required
                            />
                            {errors.alamat && <p className="mt-1 text-[11px] text-red-600 font-semibold">{errors.alamat}</p>}
                        </div>
                        <div>
                            <label className="field-label">Wilayah RT</label>
                            <input type="text" className="m-input" value={`${rt.nama} / ${rt.rw?.nama}`} disabled />
                        </div>
                    </div>

                    <div className="field-group">
                        <label className="field-label" style={{ marginBottom: 0 }}>Foto KTP asli</label>
                        
                        {!cameraActive && !photoPreview && (
                            <div className="upload-zone" onClick={startCamera}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8a2 2 0 0 1 2-2h1.2a1 1 0 0 0 .9-.55l.6-1.2A1 1 0 0 1 9.6 3.7h4.8a1 1 0 0 1 .9.55l.6 1.2a1 1 0 0 0 .9.55H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z"/><circle cx="12" cy="13" r="3.4"/></svg>
                                <strong>Ambil foto langsung dari kamera</strong>
                                <small>Wajib dari kamera HP saat ini &mdash; unggah dari galeri tidak diperbolehkan</small>
                            </div>
                        )}

                        {cameraActive && (
                            <div className="w-full relative flex justify-center bg-[#1B2333] rounded-xl overflow-hidden shadow-inner">
                                <video 
                                    ref={videoRef} 
                                    className="w-full h-auto max-h-[350px] object-cover" 
                                    playsInline 
                                    muted 
                                ></video>
                                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-4">
                                    <button
                                        type="button"
                                        onClick={stopCamera}
                                        className="chip bg-white/20 text-white border-white/30 backdrop-blur-md"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={capturePhoto}
                                        className="chip bg-[var(--brass)] text-white border-[var(--brass)] shadow-lg"
                                    >
                                        📸 Jepret Foto
                                    </button>
                                </div>
                            </div>
                        )}

                        {photoPreview && (
                            <div className="w-full relative flex justify-center bg-[#1B2333] rounded-xl overflow-hidden shadow-inner p-2 border-2 border-[var(--brass)]">
                                <img src={photoPreview} alt="Preview" className="w-full h-auto max-h-[350px] object-cover rounded-lg" />
                                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                                    <button
                                        type="button"
                                        onClick={retake}
                                        className="chip bg-white/20 text-white border-white/30 backdrop-blur-md"
                                    >
                                        Ulangi Foto
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <canvas ref={canvasRef} className="hidden"></canvas>
                        {errors.foto && <p className="mt-1 text-[11px] text-red-600 font-semibold">{errors.foto}</p>}
                    </div>
                </form>
            </div>

            <div className="fixed-frame z-40">
                <div className="submit-bar">
                    <button type="submit" form="tambah-warga-form" className="btn-block" disabled={processing}>
                        {processing ? 'Menyimpan...' : 'Simpan warga baru'}
                    </button>
                </div>
            </div>
        </PetugasLayout>
    );
}
