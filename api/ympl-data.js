export default async function handler(req, res) {
  // 1. CORS 설정 (어디서든 fetch 요청이 가능하도록 허용)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  // OPTIONS 요청(Preflight) 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Vercel 캐싱 설정 (1시간 동안 Edge Network에 캐시되어 GitHub 과부하 예방)
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

  try {
    // 3. 동적 경로 받아오기 (예: ['docs', 'txt', '아이유.txt'])
    const { path } = req.query;

    if (!path || path.length === 0) {
      return res.status(400).send('잘못된 파일 경로 요청입니다.');
    }

    // 배열 형태의 경로를 문자열 경로로 결합 (예: "docs/txt/아이유.txt")
    const filePath = Array.isArray(path) ? path.join('/') : path;

    // 4. GitHub Raw URL 생성 (한글 파일명 및 특수문자 안전하게 인코딩)
    const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/bipapalula3/YMPL/main';
    const targetUrl = `${GITHUB_RAW_BASE}/${encodeURI(filePath)}`;

    // 5. GitHub에서 데이터 가져오기
    const response = await fetch(targetUrl);

    if (!response.ok) {
      return res.status(response.status).send(`파일을 찾을 수 없습니다: ${filePath}`);
    }

    // 6. 확장자별 응답 처리 (JSON vs HTML vs TXT vs 기타)
    if (filePath.endsWith('.json')) {
      const jsonData = await response.json();
      return res.status(200).json(jsonData);
    } else {
      const textData = await response.text();

      // Content-Type 헤더 지정으로 브라우저/클라이언트의 정확한 인코딩 보장
      if (filePath.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
      } else if (filePath.endsWith('.txt')) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      } else if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      }

      return res.status(200).send(textData);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).send('서버 내부 에러가 발생했습니다.');
  }
}
