import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const secret = process.env.JWT_SECRET

export const generateToken = (user) => {
    return jwt.sign(
        {
            firstName: user.firstName,
            email: user.email,
            role: user.role,
        },
        secret,
        { expiresIn: "24h" }
    )
}

export const verifyToken = (token) => {
    return jwt.verify(token, secret)
}