/*
* Creates a random 6 digit number.
*/
export const createActivationCode = () => {
    return Math.floor(Math.random() * 1e6).toString().padStart(6, '0');
}
