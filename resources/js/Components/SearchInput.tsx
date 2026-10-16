import React, { useState, useEffect, useRef } from 'react';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    debounceMs?: number;
}

export default function SearchInput({
    value,
    onChange,
    placeholder = 'Cari nama warga...',
    className = '',
    debounceMs = 0,
}: SearchInputProps) {
    const [localValue, setLocalValue] = useState(value);
    const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLocalValue(val);

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        if (debounceMs > 0) {
            debounceTimeout.current = setTimeout(() => {
                onChange(val);
            }, debounceMs);
        } else {
            onChange(val);
        }
    };

    const handleClear = () => {
        setLocalValue('');
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        onChange('');
    };

    return (
        <div className={`relative flex items-center ${className}`}>
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[var(--text-soft,#7C8494)]" aria-hidden="true">
                <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="11" cy="11" r="7" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
            </div>
            <input
                type="text"
                value={localValue}
                onChange={handleChange}
                className="w-full pl-9 pr-9 py-2 bg-[#FBFAF7] sm:bg-white border border-[var(--line-2,#D4CEBF)] rounded-[9px] text-[13.5px] leading-snug text-[var(--ink,#1B2333)] placeholder:text-[var(--text-soft,#7C8494)] focus:outline-none focus:border-[var(--brass,#A97A2E)] focus:ring-1 focus:ring-[var(--brass,#A97A2E)] transition-colors"
                placeholder={placeholder}
            />
            {localValue && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-2.5 flex items-center justify-center w-5 h-5 rounded-full text-[var(--text-soft,#7C8494)] hover:text-[var(--ink,#1B2333)] hover:bg-[#EAE6DC] focus:outline-none transition-colors"
                    aria-label="Hapus pencarian"
                >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            )}
        </div>
    );
}
