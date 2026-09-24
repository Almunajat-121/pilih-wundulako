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

    return (
        <PetugasLayout title="Tambah Warga Baru">
            <div className="mb-4">
                <Link href={`/petugas/wilayah/${rt.id}`} className="text-gray-500 hover:text-gray-700 text-sm">
                    ⬅️ Kembali
                </Link>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div className="bg-white p-5 rounded-xl shadow-sm border space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Wilayah RT/RW</label>
                        <input
                            type="text"
                            value={`${rt.nama} — ${rt.rw?.nama}`}
                            readOnly
                            className="w-full bg-gray-100 rounded-lg border-gray-300 p-3 text-sm text-gray-600 border"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap (Sesuai KTP)</label>
                        <input
                            type="text"
                            value={data.nama}
                            onChange={e => setData('nama', e.target.value)}
                            placeholder="Masukkan nama warga..."
                            className={`w-full rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 text-sm border ${errors.nama ? 'border-red-500' : 'border-gray-300'}`}
                            required
                        />
                        {errors.nama && <p className="mt-1 text-sm text-red-600">{errors.nama}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                        <textarea
                            value={data.alamat}
                            onChange={e => setData('alamat', e.target.value)}
                            placeholder="Detail alamat domisili saat ini..."
                            rows={3}
                            className={`w-full rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 text-sm border ${errors.alamat ? 'border-red-500' : 'border-gray-300'}`}
                            required
                        ></textarea>
                        {errors.alamat && <p className="mt-1 text-sm text-red-600">{errors.alamat}</p>}
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Foto KTP/KK (Opsional)</h3>
                    
                    <div className="rounded-lg overflow-hidden bg-gray-100 flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed border-gray-300 relative">
                        {!cameraActive && !photoPreview && (
                            <div className="text-center p-6">
                                <span className="text-4xl block mb-2">📸</span>
                                <p className="text-sm text-gray-500 mb-4">Verifikasi identitas warga</p>
                                <button
                                    type="button"
                                    onClick={startCamera}
                                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                                >
                                    Buka Kamera
                                </button>
                            </div>
                        )}

                        {cameraActive && (
                            <div className="w-full relative flex justify-center bg-black">
                                <video 
                                    ref={videoRef} 
                                    className="w-full max-h-[400px] object-contain" 
                                    playsInline 
                                    muted 
                                ></video>
                                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                                    <button
                                        type="button"
                                        onClick={stopCamera}
                                        className="px-4 py-2 bg-red-600/80 text-white rounded-lg text-sm font-medium backdrop-blur-sm"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={capturePhoto}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg"
                                    >
                                        Ambil Foto
                                    </button>
                                </div>
                            </div>
                        )}

                        {photoPreview && (
                            <div className="w-full relative flex justify-center bg-black">
                                <img src={photoPreview} alt="Preview" className="w-full max-h-[400px] object-contain" />
                                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                                    <button
                                        type="button"
                                        onClick={retake}
                                        className="px-4 py-2 bg-gray-900/70 text-white rounded-lg text-sm font-medium backdrop-blur-sm"
                                    >
                                        Ulangi Foto
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <canvas ref={canvasRef} className="hidden"></canvas>
                    </div>
                    {errors.foto && <p className="mt-2 text-sm text-red-600">{errors.foto}</p>}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-4 px-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {processing ? 'Menyimpan...' : 'Simpan & Lanjutkan ke Voting'}
                </button>
            </form>
        </PetugasLayout>
    );
}
