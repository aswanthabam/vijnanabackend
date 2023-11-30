import { Response } from "express";
import { RequestLog } from "./models/Log";

export type _Response = {
  status: string;
  message: string;
  data?: {} | [];
};

export class CustomResponse {
  response: _Response = { status: "", message: "" };
  res: Response;

  constructor(
    res: Response,
    status?: string,
    data?: [] | {} | null,
    message?: string
  ) {
    this.res = res;
    this.response = {
      status: status ? status : "",
      message: message ? message : "",
      data: data ? data : undefined,
    };
  }

  set_data(data: {}) {
    if (this.response) {
      this.response.data = data;
    }
  }
  set_data_key(key: string, value: string | {} | []) {
    if (!this.response.data) this.response.data = {};
    (this.response.data as any)[key] = value;
  }
  set_message(message: string) {
    if (this.response) {
      this.response.message = message;
    }
  }

  async _send(status: number): Promise<boolean> {
    var logID = this.res.getHeader("logID");
    if (logID) {
      var val = await RequestLog.findOne({ _id: logID }).exec();
      if (val) {
        val.response = JSON.stringify(this.response);
        val.status = status;
        await val.save();
      }
    }
    if (!this.res.headersSent) {
      this.res.json(this.response).status(status);
      return true;
    } else {
      console.log("Headers Already Sent !!!");
      return false;
    }
  }
  async send_failiure_response(status: number = 400): Promise<boolean> {
    this.response.status = "failed";
    return await this._send(status);
  }
  async send_success_response(status: number = 200): Promise<boolean> {
    this.response.status = "success";
    return await this._send(status);
  }

  async send_500_response(): Promise<boolean> {
    this.response.status = "failed";
    this.response.message = "Unexpected error occured! Please Contact admin";
    return await this._send(500);
  }
  async send_message(message: string, status: number = 200): Promise<boolean> {
    this.response.status = status == 200 ? "success" : "failed";
    this.response.message = message;
    return await this._send(status);
  }
  async send_response(
    status: number,
    message: string,
    data?: {} | [] | undefined
  ): Promise<boolean> {
    this.response.message = message;
    this.response.data = data;
    return await this._send(status);
  }
}
