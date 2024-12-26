import React, { useState } from 'react';

interface MultiSelectProps {
    value: string[];
    options: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
    value,
    options,
    onChange,
    placeholder
}) => {
    const [inputValue, setInputValue] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className="jp-snippets-multi-select">
            <div>
                {value.map(tag => (
                    <span key={tag} className="jp-snippets-tag">
                        {tag}
                        <button onClick={() => onChange(value.filter(v => v !== tag))}>×</button>
                    </span>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onFocus={() => setIsEditing(true)}
                    onBlur={() => setTimeout(() => setIsEditing(false), 200)}
                    placeholder={placeholder}
                />
            </div>
            {isEditing && (
                <div className="jp-snippets-options">
                    {options
                        .filter(opt => !value.includes(opt) && opt.toLowerCase().includes(inputValue.toLowerCase()))
                        .map(opt => (
                            <div
                                key={opt}
                                className="jp-snippets-option"
                                onClick={() => {
                                    onChange([...value, opt]);
                                    setInputValue('');
                                }}
                            >
                                {opt}
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}; 