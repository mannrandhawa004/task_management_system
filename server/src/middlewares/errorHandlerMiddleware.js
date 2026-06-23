import { AppError } from "../utils/errorHandler.js"

export const errorHandler = (err, req, res, next) => {

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        })
    }

    if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map(e => e.message)

        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors
        })
    }

    console.error("Unexpected error:", err)

    return res.status(500).json({
        success: false,
        message: "Internal server error"
    })
}