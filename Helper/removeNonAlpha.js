const removeNonAlpha = (str) => {
    return str.replace(/[^a-zA-Z]/g, '');
}

export default removeNonAlpha