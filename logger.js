//logger.js
import winston from "winston"



//Crear el logger
const logger = winston.createLogger({
	level: process.env.LOG_LEVEL || 'info',
	format: winston.format.json(),
	transports: [new winston.transports.Console()],
});

export default logger