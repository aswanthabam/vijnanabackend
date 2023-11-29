"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomResponse = void 0;
class CustomResponse {
    constructor(res, status, data, message) {
        this.response = { status: "", message: "" };
        this.res = res;
        this.response = {
            status: status ? status : "",
            message: message ? message : "",
            data: data ? data : undefined,
        };
    }
    set_data(data) {
        if (this.response) {
            this.response.data = data;
        }
    }
    set_data_key(key, value) {
        if (this.response.data && typeof this.response.data == typeof {}) {
            this.response.data[key] = value;
        }
    }
    set_message(message) {
        if (this.response) {
            this.response.message = message;
        }
    }
    send_failiure_response(status = 400) {
        this.response.status = "failed";
        return this.res.json(this.response).status(status);
    }
    send_success_response(status = 200) {
        this.response.status = "success";
        return this.res.json(this.response).status(status);
    }
    send_500_response() {
        this.response.status = "failed";
        this.response.message = "Unexpected error occured! Please Contact admin";
        return this.res.json(this.response).status(500);
    }
    send_message(message, status = 200) {
        this.response.status = status == 200 ? "success" : "failed";
        this.response.message = message;
        return this.res.json(this.response).status(status);
    }
    send_response(status, message, data) {
        this.response.message = message;
        this.response.data = data;
        return this.res.json(this.response).status(status);
    }
}
exports.CustomResponse = CustomResponse;
