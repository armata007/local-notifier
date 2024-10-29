type Check = {
  name: string;
  url: string;
  cronTime: string;
};

export type RegexpCheck = Check & {
  type: "regexp";
  regexps: { regexp: RegExp; message: string }[];
};

type BasicJsonProperties = { property: string; message };

type BooleanValue = { value: { type: "boolean"; value: boolean } };
type StringValue = { value: { type: "string"; value: string } };
type NumberValue = {
  value: {
    type: "number";
    value: number;
    modifier: "greaterthan" | "lesserthan" | "equals";
  };
};
type RegexpValue = { value: { type: "regexp"; value: RegExp } };

export type JsonCheck = Check & {
  type: "json";
  jsonProperties: (BasicJsonProperties &
    (BooleanValue | StringValue | NumberValue | RegexpValue))[];
};
