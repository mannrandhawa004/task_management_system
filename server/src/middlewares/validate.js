import { validationResult } from "express-validator";
import { BadRequestError } from "../utils/errorHandler.js";

export const validate = (req, res, next) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
        const extrectedErrors = error.array().map(err => err.msg);

        return next(
            new BadRequestError(extrectedErrors.join(","))
        );
    }

    next();

}