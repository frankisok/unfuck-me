
/** Returns the current timestamp in milliseconds since the Unix Epoch. */
export const getTimeStamp = (): number => {
    return new Date().getTime();
}

/** Returns the current Unix timestamp in seconds since the Unix Epoch. */
export const getUnixTimeStamp = (): number => {
    return Math.floor(getTimeStamp() / 1000);
}