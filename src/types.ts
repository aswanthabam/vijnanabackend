export type _Response = {
  status: number;
  status_string: string;
  message: string | undefined;
  data: {} | [] | undefined;
};

export type _UserStep1 = {
  name: string;
  email: string;
  password: string | null;
  picture: string | null;
};
