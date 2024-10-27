function hashStringToNumber(str, modulo) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) % modulo;
    }
    return hash;
}

export const fetchItemByObjectID = async (objectID) => {
    const chunkCount = 100; // --- :cache_chunks Ensure this matches the script generating the cache
    const hashIndex = hashStringToNumber(objectID, chunkCount);
    const chunkFile = `${hashIndex}.json`;

    try {
        const response = await fetch(`/cache/chunks/${chunkFile}`);

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        const chunkData = await response.json();
        const item = chunkData.find((item) => item.objectID === objectID);

        if (!item) {
            throw new Error(`Item not found for objectID ${objectID}`);
        }

        return item;
    } catch (error) {
        // Provide more detailed error messages
        throw new Error(`Could not fetch data for objectID ${objectID}: ${error.message}`);
    }
};
