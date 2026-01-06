import asyncio
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import json
import firebase_admin
from firebase_admin import credentials, firestore

# 1. Firebase 초기화
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()


# 데이터 스크래핑
async def scrape_project_list():
    url = "https://script.google.com/macros/s/AKfycbw-3wum0h3gMxEQgK8P3ORktUkiyqOF3EQrLcWjoeRXyQaKCgTHJ7I_bp6NhtBH9jEB/exec"
    print(f"접속중 : {url}", url)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        await page.goto(url, wait_until="domcontentloaded", timeout=60000)

        # 1. Iframe 내부 접근(#userHtmlFrame)
        # iframe 로드까지 대기
        outer_frame = page.frame_locator("#sandboxFrame")
        inner_frame = outer_frame.frame_locator("#userHtmlFrame")


        """
        iframe 내부 리스트 박스 나타날 때까지 대기
            <div id = "list> 
                <div class="item">
                    <div> <b> [1] 머신 언러닝 ~~</div>
                    <div> class="muted"> 지도교수 : 양희철 ~~
                </div>
                <div class="item"> ... 반복
        """

        list_element = inner_frame.locator("#list")
        await list_element.wait_for()

        # 2. iframe 내부 HTML 가져오기
        inner_html = await list_element.inner_html()
        soup = BeautifulSoup(inner_html, "html.parser")

        # 3. 데이터 파싱
        items = soup.select(".item")
        projects = []

        for item in items:
            # 제목 - <b> 태그
            title = item.find("b").get_text(strip=True) if item.find("b") else "제목없음"
            id = int(title.split(']')[0][1:])

            # 지도교수 - class : muted
            muted_div = item.select_one(".muted")
            professor = ""
            if muted_div:
                professor = muted_div.find(string=True, recursive=False).strip()

            # 상태 - class : chip closed 또는 chip
            status_closed = item.select_one(".chip.closed")
            status = "마감" if status_closed else "모집중"

            # 신청팀 - chip 클래스 중 몇 팀 신청중인지 텍스트로 표시되어있음
            chips = item.select(".chip")
            team_text = ""
            applying = 0
            for chip in chips :
                if "팀 신청" in chip.get_text():
                    team_text = chip.get_text(strip=True)
                    applying = int(team_text[0])

            project_data = {
                "id": id,
                "title": title,
                "professor": professor,
                "status": status,
                "applying": applying,
                "team": team_text,
            }

            # 2. Firestore 저장
            db.collection("project").document(f"{id:02d}").set(project_data)
            projects.append(project_data)

        await browser.close()
        return projects

if __name__ == "__main__":
    results = asyncio.run(scrape_project_list()) # json 객체 배열 생성 (38개의 json 객체를 담은 배열)
    print(json.dumps(results, indent=2, ensure_ascii=False)) # pretty print

