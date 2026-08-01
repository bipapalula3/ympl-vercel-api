export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

  try {
    // github.io 저장소의 Raw URL
    const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/bipapalula3/bipapalula3.github.io/main/data.json';
    
    const response = await fetch(GITHUB_RAW_URL);
    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'GitHub Pages 데이터를 가져오는데 실패했습니다.' });
  }
}
