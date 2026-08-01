export default async function handler(req, res) {
  // 1. [Vercel 핵심 설정]
  // s-maxage=3600 : Vercel이 깃허브 데이터를 1시간(3600초) 동안 저장해두고 재사용함
  // stale-while-revalidate : 1시간이 지나면 백그라운드에서 조용히 새 데이터로 갱신함
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

  try {
    // 2. 실제로 앱이 받아오고 싶은 GitHub 파일의 Raw URL 주소를 적습니다.
    const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/bipapalula3/YMPL/main/data.json';
    
    const response = await fetch(GITHUB_RAW_URL);
    const data = await response.json();

    // 3. Vercel이 앱에게 데이터를 예쁘게 돌려줍니다.
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: '데이터를 가져오는데 실패했습니다.' });
  }
}
