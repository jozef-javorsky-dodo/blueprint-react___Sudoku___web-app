import React from 'react';

interface ButtonGroupProps {
    children: React.ReactNode;
    vertical?: boolean;
    fill?: boolean;
    className?: string;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({
    children,
    vertical = false,
    fill = false,
    className
}) => {
    const classNames = [
        'bp5-button-group',
        vertical ? 'bp5-vertical' : '',
        fill ? 'bp5-fill' : '',
        className,
    ].filter(Boolean).join(' ');

    return <div className={classNames} role="group">{children}</div>;
};

export default ButtonGroup;