import React, { useState } from 'react';
import { useIsMobile } from '../../lib/useIsMobile';
import { useForm, router, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { PageProps, PaginatedData, Vote, StatusLog } from '../../types';

interface AuditProps extends PageProps {
    votes?: PaginatedData<Vote>;
    status_logs?: PaginatedData<StatusLog>;
    tab: 'votes' | 'status_logs';
    filters: any;
}

export default function Audit({
votes, status_logs, tab, filters }: AuditProps) {
    const isMobile = useIsMobile();
    const [voidModal, setVoidModal] = useState<number | null>(null);
    const { data, setData, put, reset, processing, errors } = useForm({
        alasan: '',
    });

    const handleVoid = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/audit/votes/${voidModal}/void`, {
            onSuccess: () => {
                setVoidModal(null);
                reset();
            }
        });
    };


    if (isMobile) {
        const type = tab;
        const data = type === 'votes' ? votes : status_logs;
        return (
            <AdminLayout title="Audit Log">
                <div className="chip-row no-scrollbar" style={{ padding: '12px 18px', background: 'var(--card)' }}>
                    <Link href="/admin/audit/votes" className={`chip ${type === 'votes' ? 'active' : ''}`}>Riwayat Vote</Link>
                    <Link href="/admin/audit/status-logs" className={`chip ${type === 'status-logs' ? 'active' : ''}`}>Log Status Warga</Link>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '26px', paddingTop: '12px' }}>
                    {type === 'votes' ? (
                        (data.data as Vote[]).map(v => (
                            <div className={`m-card ${v.status === 'void' ? 'tone-maroon' : ''}`} key={v.id}>
                                <div className="m-card-top">
                                    <h3 className="m-card-name" style={{ fontSize: '14.5px' }}>{v.warga?.nama || 'Warga Terhapus'}</h3>
                                    <span className={`badge ${v.status === 'valid' ? 'badge-moss' : 'badge-maroon'}`}>{v.status === 'valid' ? 'Sah' : 'Dibatalkan'}</span>
                                </div>
                                <p style={{ fontSize: '12px', color: 'var(--text-soft)', margin: '0 0 10px' }}>
                                    Oleh <strong style={{ color: 'var(--text)' }}>{v.petugas?.username || '-'}</strong> &middot; <span className="mono">{new Date(v.created_at).toLocaleString('id-ID')}</span>
                                </p>
                                
                                {v.status === 'valid' ? (
                                    <button onClick={() => setVoidModal(v.id)} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', color: 'var(--maroon)', borderColor: 'var(--maroon-soft)' }}>Batalkan suara (void)</button>
                                ) : (
                                    <p style={{ fontSize: '12px', color: 'var(--text-soft)', fontStyle: 'italic', margin: 0 }}>Alasan: {v.alasan_void || '-'}</p>
                                )}
                            </div>
                        ))
                    ) : (
                        (data.data as StatusLog[]).map(log => (
                            <div className="m-card" key={log.id}>
                                <div className="m-card-top">
                                    <h3 className="m-card-name" style={{ fontSize: '14.5px' }}>{log.warga?.nama || 'Warga Terhapus'}</h3>
                                    <span className="badge badge-slate">{log.jenis}</span>
                                </div>
                                <p style={{ fontSize: '12px', color: 'var(--text-soft)', margin: '0 0 8px' }}>
                                    Oleh <strong style={{ color: 'var(--text)' }}>{log.aktor?.username || '-'}</strong> &middot; <span className="mono">{new Date(log.created_at).toLocaleString('id-ID')}</span>
                                </p>
                                <div style={{ background: 'var(--slate-soft)', padding: '8px 10px', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ textDecoration: 'line-through', color: 'var(--text-soft)' }}>{log.status_lama}</span>
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                    <span style={{ fontWeight: 600 }}>{log.status_baru}</span>
                                </div>
                            </div>
                        ))
                    )}
                    
                    <p className="footnote-m">Menampilkan {data.data.length} entri</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
                        {data.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`chip-btn ${link.active ? 'active' : ''}`}
                                style={{ 
                                    background: link.active ? 'var(--ink)' : 'var(--slate-soft)', 
                                    color: link.active ? '#fff' : 'var(--slate)',
                                    opacity: !link.url ? 0.5 : 1,
                                    pointerEvents: !link.url ? 'none' : 'auto',
                                    textDecoration: 'none'
                                }}
                            />
                        ))}
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Audit & Log Suara">
            <div className="card">
                <div className="tabs">
                    <Link href="/admin/audit/votes" className={`tab ${tab === 'votes' ? 'active' : ''}`} style={{ textDecoration: 'none' }}>Log Suara</Link>
                    <Link href="/admin/audit/status-logs" className={`tab ${tab === 'status_logs' ? 'active' : ''}`} style={{ textDecoration: 'none' }}>Log Perubahan Status</Link>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                    {tab === 'votes' && votes && (
                        <table>
                            <thead>
                                <tr>
                                    <th>Waktu</th>
                                    <th>Petugas</th>
                                    <th>Pemilih (Warga)</th>
                                    <th>Pilihan & Tingkat</th>
                                    <th>Status suara</th>
                                    <th style={{ textAlign: 'right' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {votes.data.map(vote => (
                                    <tr key={vote.id} className={vote.status !== 'valid' ? 'row-flag' : ''}>
                                        <td className="mono" style={{ color: 'var(--text-soft)', fontSize: '12.5px' }}>
                                            {new Date(vote.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{vote.petugas?.nama}</td>
                                        <td>
                                            <div>{vote.warga?.nama}</div>
                                            {vote.warga?.foto_bukti_hadir_path && (
                                                <a 
                                                    href={`/storage/${vote.warga.foto_bukti_hadir_path}`} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    style={{ fontSize: '11px', color: 'var(--brass)', textDecoration: 'underline', marginTop: '4px', display: 'inline-block' }}
                                                >
                                                    â†— Lihat Bukti Hadir
                                                </a>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{vote.kandidat?.nama}</div>
                                            <div style={{ fontSize: '11.5px', color: 'var(--text-soft)', marginTop: 2 }}>Pemilihan {vote.jenis}</div>
                                        </td>
                                        <td>
                                            {vote.status === 'valid' ? (
                                                <span className="badge badge-moss">Sah</span>
                                            ) : (
                                                <span className="badge badge-maroon">Dibatalkan</span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            {vote.status === 'valid' ? (
                                                <button onClick={() => setVoidModal(vote.id)} className="btn btn-danger btn-sm">Batalkan suara (void)</button>
                                            ) : (
                                                <div style={{ fontSize: '11.5px', color: 'var(--text-soft)', fontStyle: 'italic', textAlign: 'right' }}>
                                                    {vote.alasan_void}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {votes.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-soft)', padding: '30px' }}>Data tidak ditemukan.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                    
                    {tab === 'status_logs' && status_logs && (
                        <table>
                            <thead>
                                <tr>
                                    <th>Waktu</th>
                                    <th>Aktor</th>
                                    <th>Warga</th>
                                    <th>Jenis</th>
                                    <th>Perubahan Status</th>
                                    <th>Alasan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {status_logs.data.map(log => (
                                    <tr key={log.id}>
                                        <td className="mono" style={{ color: 'var(--text-soft)', fontSize: '12.5px' }}>
                                            {new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{log.aktor?.nama || 'Sistem'}</td>
                                        <td>{log.warga?.nama}</td>
                                        <td>{log.jenis}</td>
                                        <td>
                                            <span style={{ color: 'var(--text-soft)' }}>{log.status_lama}</span> 
                                            <span style={{ margin: '0 8px', color: 'var(--line-2)' }}>→</span> 
                                            <span style={{ fontWeight: 600 }}>{log.status_baru}</span>
                                        </td>
                                        <td style={{ color: 'var(--text-soft)', fontSize: '12.5px' }}>{log.alasan || '-'}</td>
                                    </tr>
                                ))}
                                {status_logs.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-soft)', padding: '30px' }}>Data tidak ditemukan.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
                
                {tab === 'votes' && votes && votes.last_page > 1 && (
                    <div className="footnote" style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        {votes.links.map((link, idx) => (
                            <Link key={idx} href={link.url || '#'} className={`badge ${link.active ? 'badge-ink' : 'badge-slate'}`} style={{ opacity: !link.url ? 0.5 : 1, textDecoration: 'none' }} dangerouslySetInnerHTML={{ __html: link.label }} />
                        ))}
                    </div>
                )}
                
                {tab === 'status_logs' && status_logs && status_logs.last_page > 1 && (
                    <div className="footnote" style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        {status_logs.links.map((link, idx) => (
                            <Link key={idx} href={link.url || '#'} className={`badge ${link.active ? 'badge-ink' : 'badge-slate'}`} style={{ opacity: !link.url ? 0.5 : 1, textDecoration: 'none' }} dangerouslySetInnerHTML={{ __html: link.label }} />
                        ))}
                    </div>
                )}
            </div>

            {voidModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 text-red-600">Peringatan Void Suara</h3>
                        <p className="text-gray-600 mb-4 text-sm">Anda akan membatalkan (void) suara ini. Tindakan ini akan mengurangi perolehan suara kandidat dan mereset status warga. Harap masukkan alasan yang jelas.</p>
                        <form onSubmit={handleVoid}>
                            <textarea 
                                value={data.alasan} 
                                onChange={e => setData('alasan', e.target.value)} 
                                placeholder="Alasan void (min. 10 karakter)..." 
                                className="w-full border-gray-300 rounded-md shadow-sm mb-2" 
                                rows={3} 
                                required 
                                minLength={10}
                            ></textarea>
                            {errors.alasan && <p className="text-red-500 text-xs mb-4">{errors.alasan}</p>}
                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => { setVoidModal(null); reset(); }} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md">Batal</button>
                                <button type="submit" disabled={processing || data.alasan.length < 10} className="px-4 py-2 text-sm text-white bg-red-600 rounded-md disabled:opacity-50">Void Suara</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
