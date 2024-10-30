export const getHashFromUrl = () => {
    const hash = window.location.hash.split('#')[1];
    return hash || null;
};

export const getValidIndex = (val) => {
    switch(val.toLowerCase()) {
        case 'vault':
        case 'galactapedia':
        case 'posts':
            return val;
        default: return 'vault';
    }
};

export const getDBFromUrl = () => {
    const db = (new URLSearchParams(window.location.search)).get('db').toLowerCase();
    return getValidIndex(db) || 'vault';
};
