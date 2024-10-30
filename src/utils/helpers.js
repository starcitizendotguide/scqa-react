export const getHashFromUrl = () => {
    const hash = window.location.hash.split('#')[1];
    return hash || null;
};

export const databaseToFilter = (db) => {
    switch (db) {
        case 'Galactapedia': return 'galactapedia';
        case 'Posts': return 'posts';

        default:
        case 'Vault': return 'vault';
    }
};

export const filterToDatabase = (filter) => {
    switch (filter) {
        case 'galactapedia': return 'Galactapedia';
        case 'posts': return 'Posts';
        case 'vault': return 'Vault';
        default: return undefined;
    }
};
