import got from 'got';

export async function fetchUserData(userId: string) {
  const url = `https://api.example.com/user/${userId}`;
  
  try {
    const response = await got(url, {
      responseType: 'json',
      throwHttpErrors: true,
      timeout: {
        request: 10000
      }
    });
    
    return response.body;
  } catch (error) {
    if (error instanceof got.HTTPError) {
      throw new Error(`HTTP Error ${error.response.statusCode}: ${error.response.statusMessage}`);
    }
    if (error instanceof got.ParseError) {
      throw new Error('Failed to parse response as JSON');
    }
    if (error instanceof got.TimeoutError) {
      throw new Error('Request timeout');
    }
    throw error;
  }
}
