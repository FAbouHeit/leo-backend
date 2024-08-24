import dotenv from "dotenv";
dotenv.config();

export const createOneTimePassword = () => {
    const length = process.env.OTP_LENGTH;
    const charset = process.env.OTP_CHARSET;
    let password = "";
    
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    
    return password;
}

export const create2FACode = (user) => {
    
    const length = process.env.TWO_FACTORAUTH_LENGTH;
    const charset = process.env.TWO_FACTORAUTH_CHARSET;

    let code = "";
    
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        code += charset[randomIndex];
    }
    
    return code;
}