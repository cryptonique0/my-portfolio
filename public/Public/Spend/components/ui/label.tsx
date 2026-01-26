import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${className || ''}`}
      {...props}
    />
  )
);

Label.displayName = 'Label';
