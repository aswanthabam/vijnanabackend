import { Response } from "express";

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

  _send(status: number): boolean {
    if (!this.res.headersSent) {
      this.res.json(this.response).status(status);
      return true;
    } else {
      console.log("Headers Already Sent !!!");
      return false;
    }
  }
  send_failiure_response(status: number = 400): boolean {
    this.response.status = "failed";
    return this._send(status);
  }
  send_success_response(status: number = 200): boolean {
    this.response.status = "success";
    return this._send(status);
  }

  send_500_response(): boolean {
    this.response.status = "failed";
    this.response.message = "Unexpected error occured! Please Contact admin";
    return this._send(500);
  }
  send_message(message: string, status: number = 200): boolean {
    this.response.status = status == 200 ? "success" : "failed";
    this.response.message = message;
    return this._send(status);
  }
  send_response(
    status: number,
    message: string,
    data?: {} | [] | undefined
  ): boolean {
    this.response.message = message;
    this.response.data = data;
    return this._send(status);
  }
}
