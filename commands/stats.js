export const command = '/stats';
export async function handler(payload) {
  // do some stuff with the payload
  const result = {
      "response_type": "ephemeral",
      text: "stats"
  };
  return result;
}