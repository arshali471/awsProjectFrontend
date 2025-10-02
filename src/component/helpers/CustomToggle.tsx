import React from 'react'

const CustomToggle = React.forwardRef(({ children, onClick }: any, ref: any) => (
    <span
        ref={ref}
        onClick={(e) => {
            e.preventDefault();
            onClick(e);
        }}
    >
        {children}
    </span>
));

export default CustomToggle