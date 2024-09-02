import { format, transports, createLogger } from "winston";

export const logger = createLogger({
    level: "info",
    format: format.combine(
        format.colorize({message: true}),
        format.errors({stack: true}),
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss.SSS'
        }),
        format.printf(({timestamp, level, message, splat, stack}) => {
            let text = `${timestamp} ${level.toUpperCase()} ${message}`;
                text += splat!==undefined?`${splat}`:" ";
                text += stack!==undefined?`\n${stack}`:"";
            return text;
        }),
    ),
    transports: [
        new transports.Console(),
    ],
});