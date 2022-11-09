class Logger {
    private static isDebug: boolean = false;
    static log(...message: (string | object)[]) {
        if (!this.isDebug) return;
        console.log(...JSON.parse(JSON.stringify(message)));
    }
    static setIsDebug(isDebug: boolean | undefined) {
        this.isDebug = !!isDebug;
    }
}

export default Logger;
