export const getHashFromUrl = () => {
    const hash = window.location.hash.split('#')[1];
    return hash || null;
};

export const databaseToFilter = (db) => {
    switch (db) {
        case 'Galactapedia': return 'type:galactapedia';
        case 'Posts': return 'type:post';

        default:
        case 'Vault': return 'NOT type:galactapedia AND NOT type:post';
    }
};

export const filterToDatabase = (filter) => {
    switch (filter) {
        case 'type:galactapedia': return 'Galactapedia';
        case 'type:post': return 'Posts';
        case 'NOT type:galactapedia AND NOT type:post': return 'Vault';
        default: return undefined;
    }
};
