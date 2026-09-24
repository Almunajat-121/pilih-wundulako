import React from 'react';
import { Link } from '@inertiajs/react';

interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
    action?: { label: string; href: string };
}

export default function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-lg border border-dashed border-gray-300">
            <span className="text-5xl mb-4" role="img" aria-label="empty icon">
                {icon}
            </span>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
            {description && <p className="text-sm text-gray-500 mb-6">{description}</p>}
            
            {action && (
                <Link
                    href={action.href}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    {action.label}
                </Link>
            )}
        </div>
    );
}
