import axios from 'axios';

const API_KEY = 'GNS6DYR32B6IDSK8';
const CHANNEL_ID = '2793587';

export const fetchThingSpeakData = async () => {
  try {
    const response = await axios.get(
      `https://api.thingspeak.com/channels/${2793587}/feeds.json?api_key=${GNS6DYR32B6IDSK8}&results=10`
    );
    return response.data.feeds;
  } catch (error) {
    console.error("Error fetching ThingSpeak data:", error);
    return [];
  }
};
