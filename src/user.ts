import got from 'got';

export async function fetchUserData(userId: string) {
  try {
    const url = `https://api.example.com/user/${userId}`;
    const response = await got(url);
    return JSON.parse(response.body);
  } catch (error) {
    // Handle HTTP errors, network errors, and parsing errors
    if (error instanceof got.HTTPError) {
      throw new Error(`HTTP Error: ${error.response.statusCode} - ${error.message}`);
    } else if (error instanceof got.RequestError) {
      throw new Error(`Request Error: ${error.message}`);
    } else if (error instanceof SyntaxError) {
      throw new Error(`JSON Parse Error: ${error.message}`);
    } else {
      throw new Error(`Unknown Error: ${error.message}`);
    }
  }
}
