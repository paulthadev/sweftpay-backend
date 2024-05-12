const { createLogger, format, transports } = require("winston");
const rTracer = require("cls-rtracer");
const path = require("path");
const fs = require("fs");
const Module = require("module");
const InternalLog = require("../models/InternalLog");

const { combine, timestamp, label, printf } = format;

const getLogLabel = (callingModule) => {
  const parts = callingModule.filename.split(path.sep);
  return path.join(parts[parts.length - 2], parts.pop());
};
/**
 * Creates a Winston logger object.
 * ### Log Format
 * *| timestamp | request-id | module/filename | log level | log message |*
 *
 * @param {Module} callingModule the module from which the logger is called
 */
const logger = (callingModule) =>
  createLogger({
    format: combine(
      format.colorize(),
      label({ label: getLogLabel(callingModule) }),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      printf((info) => {
        const rid = rTracer.id();

        let logLevel = info?.level?.replace(/\x1B\[[0-9;]*[mK]/g, "");

        try {
          InternalLog.create({
            logId: rid,
            type: logLevel,
            label: info?.label,
            message: info?.message,
          });
        } catch (error) {}

        return rid
          ? `| ${info.timestamp} | ${rid} | ${info.label} | ${info.message} |`
          : `| ${info.timestamp} | ${info.label} | ${info.message} |`;
      })
    ),
    transports: [
      new transports.Console({
        //silent: process.env.NODE_ENV === "development"
      }),
    ],
    exitOnError: false,
  });

module.exports = logger;
