interface MqttObserver {

    onConnected: () => void;

    onDisconnected: () => void;

    onSubscribed: (topic: string | string[]) => void;

    onSubscribeFail: (topic: string | string[], error: Error) => void;

    onUnsubscribed: (topic: string | string[]) => void;

    onUnsubscribeFail: (topic: string | string[], error: Error) => void;

    onMessage: (topic: string, data: { [key: string]: any }) => void;
}

export default MqttObserver;
