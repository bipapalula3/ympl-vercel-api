export default async function handler(req, res) {
  // 1. CORS 설정 (어디서든 fetch 및 다운로드 가능)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Vercel Edge 캐싱 설정 (1시간 동안 캐시)
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

  try {
    const { path, repo } = req.query;

    if (!path || path.length === 0) {
      return res.status(400).send('잘못된 파일 경로 요청입니다.');
    }

    const filePath = Array.isArray(path) ? path.join('/') : path;
    
    // 3. 저장소 선택 (쿼리 파라미터 repo가 없으면 기본값 YMPL, repo=blog 이거나 지정시 해당 저장소 사용)
    // 예: ?repo=bipapalula3.github.io 또는 ?repo=YMPL
    const targetRepo = repo || 'YMPL';
    const GITHUB_RAW_BASE = `https://raw.githubusercontent.com/bipapalula3/${targetRepo}/main`;
    const targetUrl = `${GITHUB_RAW_BASE}/${encodeURI(filePath)}`;

    const response = await fetch(targetUrl);

    if (!response.ok) {
      return res.status(response.status).send(`파일을 찾을 수 없습니다: ${filePath} (저장소: ${targetRepo})`);
    }

    const lowerPath = filePath.toLowerCase();

    // ----------------------------------------------------
    // A. JSON 데이터 처리
    // ----------------------------------------------------
    if (lowerPath.endsWith('.json')) {
      const jsonData = await response.json();
      return res.status(200).json(jsonData);
    } 

    // ----------------------------------------------------
    // B. 이진(Binary) 데이터 처리 (Buffer로 변환)
    //    : 이미지, 오디오, 비디오, 폰트, PDF, ZIP 등
    // ----------------------------------------------------
    else if (
      // 1. 이미지
      lowerPath.endsWith('.png') || lowerPath.endsWith('.jpg') || lowerPath.endsWith('.jpeg') ||
      lowerPath.endsWith('.gif') || lowerPath.endsWith('.webp') || lowerPath.endsWith('.ico') ||
      // 2. 오디오 / 비디오
      lowerPath.endsWith('.mp3') || lowerPath.endsWith('.m4a') || lowerPath.endsWith('.wav') ||
      lowerPath.endsWith('.ogg') || lowerPath.endsWith('.mp4') || lowerPath.endsWith('.webm') ||
      // 3. 폰트
      lowerPath.endsWith('.woff') || lowerPath.endsWith('.woff2') ||
      lowerPath.endsWith('.ttf') || lowerPath.endsWith('.otf') ||
      // 4. 문서 & 압축
      lowerPath.endsWith('.pdf') || lowerPath.endsWith('.zip')
    ) {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // --- Content-Type 헤더 지정 ---
      if (lowerPath.endsWith('.png')) res.setHeader('Content-Type', 'image/png');
      else if (lowerPath.endsWith('.jpg') || lowerPath.endsWith('.jpeg')) res.setHeader('Content-Type', 'image/jpeg');
      else if (lowerPath.endsWith('.gif')) res.setHeader('Content-Type', 'image/gif');
      else if (lowerPath.endsWith('.webp')) res.setHeader('Content-Type', 'image/webp');
      else if (lowerPath.endsWith('.ico')) res.setHeader('Content-Type', 'image/x-icon');
      
      else if (lowerPath.endsWith('.mp3')) res.setHeader('Content-Type', 'audio/mpeg');
      else if (lowerPath.endsWith('.m4a')) res.setHeader('Content-Type', 'audio/mp4');
      else if (lowerPath.endsWith('.wav')) res.setHeader('Content-Type', 'audio/wav');
      else if (lowerPath.endsWith('.ogg')) res.setHeader('Content-Type', 'audio/ogg');
      else if (lowerPath.endsWith('.mp4')) res.setHeader('Content-Type', 'video/mp4');
      else if (lowerPath.endsWith('.webm')) res.setHeader('Content-Type', 'video/webm');
      
      else if (lowerPath.endsWith('.woff')) res.setHeader('Content-Type', 'font/woff');
      else if (lowerPath.endsWith('.woff2')) res.setHeader('Content-Type', 'font/woff2');
      else if (lowerPath.endsWith('.ttf')) res.setHeader('Content-Type', 'font/ttf');
      else if (lowerPath.endsWith('.otf')) res.setHeader('Content-Type', 'font/otf');
      
      else if (lowerPath.endsWith('.pdf')) res.setHeader('Content-Type', 'application/pdf');
      else if (lowerPath.endsWith('.zip')) res.setHeader('Content-Type', 'application/zip');

      return res.status(200).send(buffer);
    } 

    // ----------------------------------------------------
    // C. 텍스트 기반 데이터 처리 (UTF-8)
    //    : HTML, TXT, ads.txt, sitemap.xml, CSS, JS 등
    // ----------------------------------------------------
    else {
      const textData = await response.text();

      // --- Content-Type 헤더 지정 ---
      if (lowerPath.endsWith('.html')) res.setHeader('Content-Type', 'text/html; charset=utf-8');
      else if (lowerPath.endsWith('.txt')) res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      else if (lowerPath.endsWith('.css')) res.setHeader('Content-Type', 'text/css; charset=utf-8');
      else if (lowerPath.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      else if (lowerPath.endsWith('.xml')) res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      else if (lowerPath.endsWith('.csv')) res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      else if (lowerPath.endsWith('.md')) res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      else if (lowerPath.endsWith('.svg')) res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');

      return res.status(200).send(textData);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).send('서버 내부 에러가 발생했습니다.');
  }
}
