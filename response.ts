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
    if (this.response.data && typeof this.response.data == typeof {}) {
      (this.response.data as any)[key] = value;
    }
  }
  set_message(message: string) {
    if (this.response) {
      this.response.message = message;
    }
  }
  send_failiure_response(status: number = 400) {
    this.response.status = "failed";
    return this.res.json(this.response).status(status);
  }

  send_success_response(status: number = 200) {
    this.response.status = "success";
    return this.res.json(this.response).status(status);
  }

  send_500_response() {
    this.response.status = "failed";
    this.response.message = "Unexpected error occured! Please Contact admin";
    return this.res.json(this.response).status(500);
  }
  send_message(message: string, status: number = 200) {
    this.response.status = status == 200 ? "success" : "failed";
    this.response.message = message;
    return this.res.json(this.response).status(status);
  }
  send_response(status: number, message: string, data?: {} | [] | undefined) {
    this.response.message = message;
    this.response.data = data;
    return this.res.json(this.response).status(status);
  }
}
