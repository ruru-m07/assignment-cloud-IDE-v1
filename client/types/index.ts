export interface ResponseNewSpace {
  success: boolean;
  error: any | string | null;
  data: {
    url: string;
    id: string;
    password: string;
  } | null;
}
