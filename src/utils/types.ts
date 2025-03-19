
interface GeneralReturnInt<T> {
  message: object | string;
  statusCode: number;
  error?: "string";
  data?: T;
}
interface RejectInt {
  message: object | string;
  statusCode: 0;
  error?: "string";
}
export { GeneralReturnInt, RejectInt};
