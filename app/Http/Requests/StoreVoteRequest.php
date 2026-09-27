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
        return [
            'kandidat_rt_id' => 'nullable|exists:kandidat,id',
            'kandidat_rw_id' => 'nullable|exists:kandidat,id',
            'idempotency_key' => 'required|string',
            'verifikasi_identitas' => 'required|accepted',
            'foto_bukti' => 'required|image|max:5120',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if (empty($this->kandidat_rt_id) && empty($this->kandidat_rw_id)) {
                $validator->errors()->add('kandidat_rt_id', 'Minimal harus memilih satu kandidat (RT atau RW).');
            }
        });
    }

    public function messages(): array
    {
        return [
            'kandidat_rt_id.exists' => 'Kandidat RT tidak valid.',
            'kandidat_rw_id.exists' => 'Kandidat RW tidak valid.',
            'idempotency_key.required' => 'Kunci identifikasi sistem wajib disertakan.',
            'verifikasi_identitas.required' => 'Konfirmasi verifikasi identitas wajib dicentang.',
            'verifikasi_identitas.accepted' => 'Konfirmasi verifikasi identitas wajib dicentang.',
            'foto_bukti.required' => 'Foto bukti kehadiran warga wajib diunggah.',
            'foto_bukti.image' => 'File bukti harus berupa gambar/foto.',
            'foto_bukti.max' => 'Ukuran foto maksimal 5MB.',
        ];
    }
}