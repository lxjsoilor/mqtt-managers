import MqttObserver from './MqttObserver';
class Observer {
    private _observers: MqttObserver[] = [];
    public get observers() {
        return this._observers || [];
    }
    public addObserver(observers: MqttObserver) {
        if (!this._observers.includes(observers)) {
            this._observers.push(observers);
        }
    }

    public removeObserver(observers: MqttObserver) {
        const index = this._observers.findIndex((item: MqttObserver) => item === observers);
        if (index === -1) return;
        this._observers.splice(index, 1);
    }

    public timer(seconds: number, callback: (...args: any[]) => void) {
        return setTimeout(callback, seconds * 1000);
    }

}

export default Observer;
