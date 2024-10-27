export const getHashFromUrl = () => {
    const hash = window.location.hash.split('#')[1];
    return hash || null;
};

export const databaseToFilter = (db) => {
    switch (db) {
        case 'Galactapedia': return 'type:galactapedia';

        default:
        case 'Vault': return 'NOT type:galactapedia';
    }
};

export const filterToDatabase = (filter) => {
    switch (filter) {
        case 'type:galactapedia': return 'Galactapedia';
        case 'NOT type:galactapedia': return 'Vault';
        default: return undefined;
    }
};
