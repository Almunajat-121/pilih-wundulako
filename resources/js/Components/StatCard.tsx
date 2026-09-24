import React from 'react';

interface StatCardProps {
    label: string;
    value: number | string;
    icon?: string;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
    subtitle?: string;
}

export default function StatCard({
    label,
    value,
    icon,
    color = 'blue',
    subtitle,
}: StatCardProps) {
    let colorClasses = {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-100',
    };

    switch (color) {
        case 'green':
            colorClasses = { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' };
            break;
        case 'yellow':
            colorClasses = { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100' };
            break;
        case 'red':
            colorClasses = { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' };
            break;
        case 'gray':
            colorClasses = { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-100' };
            break;
    }

    return (
        <div className={`overflow-hidden rounded-lg bg-white p-5 shadow border ${colorClasses.border}`}>
            <div className="flex items-center gap-4">
                {icon && (
                    <div className={`flex h-12 w-12 items-center justify-center rounded-md ${colorClasses.bg} ${colorClasses.text} text-2xl`}>
                        {icon}
                    </div>
                )}
                <div>
                    <p className="truncate text-sm font-medium text-gray-500">{label}</p>
                    <p className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{value}</p>
                </div>
            </div>
            {subtitle && (
                <div className="mt-4">
                    <p className="text-sm text-gray-500">{subtitle}</p>
                </div>
            )}
        </div>
    );
}
