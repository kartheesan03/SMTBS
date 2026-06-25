import React from 'react';

const SkeletonLoader = ({ type = 'text', count = 1, className = '', style = {} }) => {
    const skeletons = [];

    for (let i = 0; i < count; i++) {
        let skeletonClass = 'skeleton-loader ';
        if (type === 'text') skeletonClass += 'skeleton-text';
        else if (type === 'short-text') skeletonClass += 'skeleton-text-short';
        else if (type === 'title') skeletonClass += 'skeleton-title';
        else if (type === 'circle') skeletonClass += 'skeleton-circle';
        else if (type === 'card') skeletonClass += 'skeleton-card';
        else if (type === 'table-row') skeletonClass += 'skeleton-text';

        skeletons.push(
            <div 
                key={i} 
                className={`${skeletonClass} ${className}`} 
                style={style}
            ></div>
        );
    }

    if (type === 'table') {
        return (
            <div className="modern-table-wrapper">
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th><div className="skeleton-loader skeleton-text" style={{ width: '60%', margin: 0 }}></div></th>
                            <th><div className="skeleton-loader skeleton-text" style={{ width: '80%', margin: 0 }}></div></th>
                            <th><div className="skeleton-loader skeleton-text" style={{ width: '70%', margin: 0 }}></div></th>
                            <th><div className="skeleton-loader skeleton-text" style={{ width: '50%', margin: 0 }}></div></th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: count || 5 }).map((_, idx) => (
                            <tr key={idx}>
                                <td><div className="skeleton-loader skeleton-text" style={{ margin: 0 }}></div></td>
                                <td><div className="skeleton-loader skeleton-text" style={{ margin: 0 }}></div></td>
                                <td><div className="skeleton-loader skeleton-text" style={{ margin: 0 }}></div></td>
                                <td><div className="skeleton-loader skeleton-text" style={{ margin: 0 }}></div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    if (type === 'dashboard') {
        return (
            <div className="page-container animate-slide-up">
                <div className="skeleton-loader skeleton-title"></div>
                <div className="responsive-grid-4">
                    <div className="skeleton-loader skeleton-card"></div>
                    <div className="skeleton-loader skeleton-card"></div>
                    <div className="skeleton-loader skeleton-card"></div>
                    <div className="skeleton-loader skeleton-card"></div>
                </div>
                <div className="skeleton-loader skeleton-card" style={{ height: '300px' }}></div>
            </div>
        );
    }

    return <>{skeletons}</>;
};

export default SkeletonLoader;
