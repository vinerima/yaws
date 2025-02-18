"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketClient = void 0;
const ws_1 = __importDefault(require("ws"));
/**
 * A WebSocket client that automatically attempts to reconnect upon disconnection
 * and periodically sends ping messages (heartbeats) to ensure the connection remains alive.
 *
 * Extend this class and override the protected `onOpen`, `onMessage`, `onError`, and `onClose` methods
 * to implement custom handling of WebSocket events.
 */
class WebSocketClient {
    /**
     * Creates a new instance of `WebSocketClient`.
     *
     * @param options - Configuration options for the WebSocket client, including URL, reconnect interval, and ping interval.
     */
    constructor(options) {
        this.ws = null;
        this.pingTimeout = null;
        this.url = options.url;
        this.reconnectInterval = options.reconnectInterval || 5000;
        this.pingInterval = options.pingInterval || 10000;
        this.run();
    }
    /**
     * Initiates a WebSocket connection to the specified URL.
     *
     * This method sets up event listeners for `open`, `message`, `error`, and `close` events.
     * When the connection opens, it starts the heartbeat mechanism.
     * On close, it attempts to reconnect after a specified interval.
     */
    run() {
        this.ws = new ws_1.default(this.url);
        this.ws.on('open', () => {
            console.info('WebSocket connected');
            this.startHeartbeat();
            this.onOpen();
        });
        this.ws.on('message', (data) => {
            this.onMessage(data);
        });
        this.ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            this.onError(error);
        });
        this.ws.on('close', () => {
            console.info('WebSocket disconnected');
            this.stopHeartbeat();
            this.onClose();
            this.reconnect();
        });
    }
    /**
     * Attempts to reconnect to the WebSocket server after the specified `reconnectInterval`.
     * It clears all event listeners on the old WebSocket and initiates a new connection.
     */
    reconnect() {
        if (this.ws) {
            this.ws.removeAllListeners();
            this.ws = null;
        }
        setTimeout(() => this.run(), this.reconnectInterval);
    }
    /**
     * Starts sending periodic ping messages to the server.
     *
     * This function uses `setInterval` to send a ping at the configured `pingInterval`.
     * If the WebSocket is not open, pings are not sent.
     */
    startHeartbeat() {
        this.pingTimeout = setInterval(() => {
            if (this.ws && this.ws.readyState === ws_1.default.OPEN) {
                this.ws.ping();
            }
        }, this.pingInterval);
    }
    /**
     * Stops sending heartbeat pings by clearing the ping interval.
     */
    stopHeartbeat() {
        if (this.pingTimeout) {
            clearInterval(this.pingTimeout);
            this.pingTimeout = null;
        }
    }
    /**
     * Called when the WebSocket connection is successfully opened.
     *
     * Override this method in a subclass to implement custom logic on connection.
     */
    onOpen() {
        // Custom logic for connection open
    }
    /**
     * Called when a WebSocket message is received.
     *
     * @param data - The data received from the WebSocket server.
     *
     * Override this method in a subclass to implement custom message handling.
     */
    onMessage(data) {
        // Custom logic for handling received messages
    }
    /**
     * Called when a WebSocket error occurs.
     *
     * @param error - The error that occurred.
     *
     * Override this method in a subclass to implement custom error handling.
     */
    onError(error) {
        // Custom logic for handling errors
    }
    /**
     * Called when the WebSocket connection is closed.
     *
     * Override this method in a subclass to implement custom logic on disconnection.
     */
    onClose() {
        // Custom logic for handling connection close
    }
    /**
     * Sends data to the connected WebSocket server, if the connection is open.
     *
     * @param data - The data to send.
     */
    send(data) {
        if (this.ws && this.ws.readyState === ws_1.default.OPEN) {
            this.ws.send(data);
        }
    }
    /**
     * Closes the WebSocket connection gracefully.
     */
    close() {
        if (this.ws) {
            this.ws.close();
        }
    }
}
exports.WebSocketClient = WebSocketClient;
exports.default = WebSocketClient;
