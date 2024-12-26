import React, { useState, useRef } from 'react';

interface MultiSelectProps {
    value: string[];
    options: string[];
    onChange: (values: string[]) => void;
    onCreate?: (value: string) => void;
    placeholder?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
    value,
    options,
    onChange,
    onCreate,
    placeholder
}) => {
    const [inputValue, setInputValue] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            addValue(inputValue.trim());
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            onChange(value.slice(0, -1));
        }
    };

    const addValue = (newValue: string) => {
        if (!value.includes(newValue)) {
            onChange([...value, newValue]);
        }
        setInputValue('');
    };

    const removeTag = (tag: string) => {
        onChange(value.filter(v => v !== tag));
    };

    const handleOptionClick = (opt: string) => {
        addValue(opt);
        inputRef.current?.focus();
    };

    const handleBlur = () => {
        setTimeout(() => {
            setIsEditing(false);
        }, 200);
    };

    return (
        <div className="jp-snippets-multi-select">
            <div>
                {value.map(tag => (
                    <span key={tag} className="jp-snippets-select-tag">
                        {tag}
                        <span 
                            className="jp-snippets-select-tag-remove"
                            onClick={() => removeTag(tag)}
                        >
                            ×
                        </span>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsEditing(true)}
                    onBlur={handleBlur}
                    placeholder={value.length === 0 ? placeholder : ''}
                />
            </div>
            {isEditing && (
                <div className="jp-snippets-options">
                    {options
                        .filter(opt => 
                            !value.includes(opt) && 
                            opt.toLowerCase().includes(inputValue.toLowerCase())
                        )
                        .map(opt => (
                            <div
                                key={opt}
                                className="jp-snippets-option"
                                onClick={() => handleOptionClick(opt)}
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                {opt}
                            </div>
                        ))
                    }
                </div>
            )}
        </div>
    );
}; 