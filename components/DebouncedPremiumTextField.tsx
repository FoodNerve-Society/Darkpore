'use client';

import React, { useState, useEffect, forwardRef } from 'react';
import PremiumTextField from './PremiumTextField';

const DebouncedPremiumTextField = forwardRef(({ value, onChange, delay = 300, ...props }: any, ref: any) => {
  const [localValue, setLocalValue] = useState(value);

  // Sync external changes (e.g. initial load or form reset)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Fire exact value when the user leaves the input
    if (onChange && localValue !== value) {
      onChange({ target: { value: localValue } } as any);
    }
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  useEffect(() => {
    // Only debounce if the user is actively typing (localValue != value)
    if (localValue === value) return;
    
    const handler = setTimeout(() => {
      if (onChange) {
        onChange({ target: { value: localValue } } as any);
      }
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [localValue, delay, onChange, value]);

  return (
    <PremiumTextField
      {...props}
      ref={ref}
      value={localValue || ''}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
});

DebouncedPremiumTextField.displayName = 'DebouncedPremiumTextField';

export default DebouncedPremiumTextField;
