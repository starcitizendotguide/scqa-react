export const getHashFromUrl = () => {
    const hash = window.location.hash.split('#')[1];
    return hash || null;
};
