import Observer from "./Observer";
import MqttObserver from './MqttObserver';
import mqtt, { IClientPublishOptions, Packet, PacketCallback } from 'mqtt';
import { MqttClient, IClientOptions } from 'mqtt';
import Logger from './Logger'

interface IClientManagerOptions extends IClientOptions {
    isDebug?: boolean;
    brokerUrl: string;
}

class MqttManager extends Observer {

    // mqtt 管理器实例
    static mqttManager: MqttManager;

    // mqtt 实例
    private mqttClient: MqttClient;

    // 存放已经订阅的主题
    private topics: Set<string> = new Set();

    // 单例
    public static getInstance() {
        if (this.mqttManager !== undefined) {
            return this.mqttManager;
        }
        this.mqttManager = new MqttManager();
        return this.mqttManager;
    }

    // 客户端id
    private clientId: string = `derucci_erp_${new Date().getTime()}${Math.random() * 100}`;

    // 初始化
    public init(opt: IClientManagerOptions) {
        Logger.setIsDebug(opt?.isDebug);
        this.mqttClient = mqtt.connect(opt.brokerUrl, {
            clientId: this.clientId,
            clean: true,
            connectTimeout: 5000, // 超时时间
            ...opt
        });
        this.mqttClient.on("connect", this.connect.bind(this));
        this.mqttClient.on("message", this.message.bind(this));
        this.mqttClient.on("disconnect", this.disconnect.bind(this));
        this.mqttClient.on("reconnect", this.reconnect.bind(this));
        this.mqttClient.on("offline", this.offline.bind(this));
        this.mqttClient.on("end", this.end.bind(this));
        this.mqttClient.on("error", this.error.bind(this));
        this.mqttClient.on("close", this.close.bind(this));

    }

    // 连接mqtt
    private connect() {
        this.observers.forEach((observer: MqttObserver) => {
            Logger.log("mqtt连接完成");
            observer.onConnected();
        })
    }

    // 接收mqtt数据
    private message(topic: string, payload: Buffer) {
        Logger.log("mqtt 数据：", topic, JSON.parse(payload.toString()));
        this.observers.forEach((observer: MqttObserver) => {
            observer.onMessage(topic, JSON.parse(payload.toString()));
        })
    }

    // 断开连接
    private disconnect() {
        this.observers.forEach((observer: MqttObserver) => {
            Logger.log("mqtt断开连接");
            observer.onDisconnected();
        })
    }

    // 重新连接
    private reconnect() {
        Logger.log("mqtt正在重连");
    }

    // 离线
    private offline() {
        Logger.log("mqtt离线");
    }

    // 结束
    private end() {
        Logger.log("mqtt结束");
    }

    // 结束
    private error(error: Error) {
        Logger.log("mqtt出错", error);
    }

    // 关闭
    private close() {
        Logger.log("mqtt关闭");
    }

    // 订阅一个或者多个主题
    public subscribe(topic: string | string[]) {
        if (typeof topic === 'string') {
            this.topics.add(topic);
        } else {
            topic.forEach(item => this.topics.add(item));
        }
        this.mqttClient.subscribe(topic, {
            qos: 0
        }, (error: Error) => {
            if (!error) {
                // 订阅成功
                Logger.log("mqtt订阅成功")
                this.observers.forEach((observer: MqttObserver) => {
                    observer.onSubscribed(topic);
                })
            } else {
                // 订阅失败
                Logger.log("mqtt订阅失败", error)
                this.observers.forEach((observer: MqttObserver) => {
                    observer.onSubscribeFail(topic, error);
                })
            }
        });
    }

    // 取消一个订阅
    public unsubscribe(topic: string | string[]) {
        this.mqttClient.unsubscribe(topic, {}, (error?: Error, packet?: Packet) => {
            if (!error) {
                this.observers.forEach((observer: MqttObserver) => {
                    observer.onUnsubscribed(topic);
                })
            } else {
                this.observers.forEach((observer: MqttObserver) => {
                    observer.onUnsubscribeFail(topic, error);
                })
            }
        });

    }

    // 取消所有订阅
    public unsubscribeAll() {
        const topic: string[] = Array.from(this.topics);
        Logger.log({ topic })
        this.mqttClient.unsubscribe(topic, {}, (error: Error | undefined) => {
            if (!error) {
                Logger.log("mqtt取消所有订阅成功");
                this.topics.clear();
                this.observers.forEach((observer: MqttObserver) => {
                    observer.onUnsubscribed(topic);
                })
                return;
            }
            Logger.log("mqtt取消所有订阅失败", error);
            this.observers.forEach((observer: MqttObserver) => {
                observer.onUnsubscribeFail(topic, error);
            })
        });
    }

    // 发布主题信息
    public publish(topic: string, message: string | Buffer,
        opts: IClientPublishOptions, callback?: PacketCallback) {
        this.mqttClient.publish(topic, message, opts, (error?: Error, packet?: Packet) => {
            callback && callback(error, packet);
            if (!error) {
                Logger.log(`${topic}发布信息成功：${message}`);
                return;
            }
            Logger.log(`${topic}发布信息失败：${message}`);
        });
    }





}

export default MqttManager;
