import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    intent?: 'primary' | 'danger' | 'default';
    large?: boolean;
    fill?: boolean;
    icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    children,
    intent = 'default',
    large = false,
    fill = false,
    icon,
    className,
    'aria-label': ariaLabel,
    ...props
}) => {
    const classNames = [
        'bp5-button',
        `bp5-intent-${intent}`,
        large ? 'bp5-large' : '',
        fill ? 'bp5-fill' : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <button className={classNames} aria-label={ariaLabel} {...props}>
            {icon && <span className="bp5-icon" aria-hidden="true">{icon}</span>}
            {children}
        </button>
    );
};

export default Button;