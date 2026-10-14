<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $warga = $this->route('warga');
        if ($warga) {
            $warga->loadMissing('rt');
        }

        return [
            'kandidat_rt_id' => [
                'nullable',
                function ($attribute, $value, $fail) use ($warga) {
                    if ($value === 'abstain' || $value === null || $value === '' || $value === 0 || $value === '0') {
                        return;
                    }
                    if (!$warga) return;

                    $exists = \App\Models\Kandidat::where('id', $value)
                        ->where('jenis', 'RT')
                        ->where('rt_id', $warga->rt_id)
                        ->exists();

                    if (!$exists) {
                        $fail('Kandidat RT yang dipilih tidak valid atau bukan dari wilayah pemilih.');
                    }
                }
            ],
            'kandidat_rw_id' => [
                'nullable',
                function ($attribute, $value, $fail) use ($warga) {
                    if ($value === 'abstain' || $value === null || $value === '' || $value === 0 || $value === '0') {
                        return;
                    }
                    if (!$warga) return;

                    $exists = \App\Models\Kandidat::where('id', $value)
                        ->where('jenis', 'RW')
                        ->where('rw_id', $warga->rt?->rw_id)
                        ->exists();

                    if (!$exists) {
                        $fail('Kandidat RW yang dipilih tidak valid atau bukan dari wilayah pemilih.');
                    }
                }
            ],
            'idempotency_key' => 'required|string',
            'verifikasi_identitas' => 'required|accepted',
            'foto_bukti' => 'required|image|max:15360',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $warga = $this->route('warga');
            if (!$warga) return;

            $needsRt = $warga->status_vote_rt === 'belum_dikunjungi';
            $needsRw = $warga->status_vote_rw === 'belum_dikunjungi';

            if ($needsRt && empty($this->kandidat_rt_id) && $this->kandidat_rt_id !== 'abstain') {
                $validator->errors()->add('kandidat_rt_id', 'Pilihan Ketua RT wajib diisi (pilih kandidat atau abstain).');
            }
            if ($needsRw && empty($this->kandidat_rw_id) && $this->kandidat_rw_id !== 'abstain') {
                $validator->errors()->add('kandidat_rw_id', 'Pilihan Ketua RW wajib diisi (pilih kandidat atau abstain).');
            }
        });
    }

    public function messages(): array
    {
        return [
            'idempotency_key.required' => 'Kunci identifikasi sistem wajib disertakan.',
            'verifikasi_identitas.required' => 'Konfirmasi verifikasi identitas wajib dicentang.',
            'verifikasi_identitas.accepted' => 'Konfirmasi verifikasi identitas wajib dicentang.',
            'foto_bukti.required' => 'Foto bukti kehadiran warga wajib diunggah.',
            'foto_bukti.image' => 'File bukti harus berupa gambar/foto.',
            'foto_bukti.max' => 'Ukuran foto maksimal 15MB.',
        ];
    }
}