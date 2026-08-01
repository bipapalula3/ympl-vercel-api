export default async function handler(req, res) {
  // CORS 허용 (어디서든 fetch 가능하도록 설정)
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // 1시간 캐싱 (Vercel Edge Network에 저장되어 GitHub API 요청 제한을 방지함)
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

  try {
    // 1. 요청된 경로 가져오기 (예: ['docs', 'blog', 'iu.html'])
    const { path } = req.query;
    
    if (!path || path.length === 0) {
      return res.status(400).send('잘못된 경로 요청입니다.');
    }

    // 배열 형태의 경로를 URL 경로 문자열로 변환 (예: "docs/blog/iu.html")
    const filePath = Array.isArray(path) ? path.join('/') : path;

    // 2. GitHub Raw 콘텐츠 URL 생성
    const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/bipapalula3/YMPL/main';
    const targetUrl = `${GITHUB_RAW_BASE}/${filePath}`;

    // 3. GitHub에서 파일 가져오기
    const response = await fetch(targetUrl);

    if (!response.ok) {
      return res.status(response.status).send('파일을 찾을 수 없습니다.');
    }

    // 4. 확장자에 따른 처리 (HTML vs JSON vs 기타)
    if (filePath.endsWith('.json')) {
      const jsonData = await response.json();
      return res.status(200).json(jsonData);
    } else {
      // HTML, TXT 등 텍스트 기반 데이터
      const textData = await response.text();
      
      // HTML 응답일 경우 Content-Type 명시 (브라우저가 잘 인식하도록)
      if (filePath.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
      }
      
      return res.status(200).send(textData);
    }
  } catch (error) {
    console.error('Fetch Error:', error);
    return res.status(500).send('서버 내부 에러가 발생했습니다.');
  }
}
