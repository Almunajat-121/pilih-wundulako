import React from 'react';

interface ProgressBarProps {
    value: number;
    color?: 'blue' | 'green' | 'yellow' | 'red';
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export default function ProgressBar({
    value,
    color = 'blue',
    showLabel = false,
    size = 'md',
}: ProgressBarProps) {
    // Clamp value between 0 and 100
    const clampedValue = Math.min(Math.max(value, 0), 100);

    let colorClass = 'bg-blue-600';
    switch (color) {
        case 'green':
            colorClass = 'bg-green-600';
            break;
        case 'yellow':
            colorClass = 'bg-yellow-500';
            break;
        case 'red':
            colorClass = 'bg-red-600';
            break;
    }

    let heightClass = 'h-2';
    switch (size) {
        case 'sm':
            heightClass = 'h-1.5';
            break;
        case 'lg':
            heightClass = 'h-4';
            break;
    }

    return (
        <div className="w-full">
            {showLabel && (
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-700">{clampedValue}%</span>
                </div>
            )}
            <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightClass}`}>
                <div
                    className={`${colorClass} ${heightClass} rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${clampedValue}%` }}
                ></div>
            </div>
        </div>
    );
}
