import { useState } from 'react'
import { db } from "./firebase_config";
import {collection, query, orderBy, onSnapshot} from "firebase/firestore";




function App() {
  // 나중에 Appwrite에서 가져올 데이터를 미리 상상해봅시다.

  // scraper/scraper.py에서 실행한 결과를 가져와서 화면에 뿌린다.
  // results : 38개의 json 객체를 담은 배열

  const [projects] = useState([
    {
      id: 1,
      title: "컴퓨터융합학부 졸업프로젝트 팀원 모집 (React/Node)",
      professor: "양희철",
      roles: ["프론트엔드", "백엔드"],
      stacks: ["react", "nodejs", "aws"],
    },
    // 더 많은 카드를 여기에 추가할 수 있습니다.
  ]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-10">
      {/* 상단 탭 (이미지 1번 스타일) */}
      <nav className="mb-8 flex gap-6 border-b pb-2 text-lg font-bold text-gray-400">
        <span className="cursor-pointer text-black border-b-2 border-black pb-2">전체</span>
        <span className="cursor-pointer hover:text-black">안녕</span>
        <span className="cursor-pointer hover:text-black">스터디</span>
      </nav>

      {/* 필터 섹션 (이미지 2번 스타일) */}
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          <button className="rounded-full border border-teal-400 bg-white px-4 py-1.5 text-sm font-bold text-teal-500 shadow-sm">👀 모집 중만 보기</button>
        </div>
        <input 
          type="text" 
          placeholder="제목, 글 내용을 검색해보세요." 
          className="w-full max-w-xs rounded-full border bg-gray-100 px-5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 md:w-80"
        />
      </div>

      {/* 게시글 그리드 레이아웃 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {projects.map((p) => (
          <div key={p.id} className="group relative rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer">
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-500">📙 {p.tag}</span>
              <span className="rounded bg-yellow-50 px-2 py-0.5 text-[10px] font-bold text-yellow-600">📦 따끈따끈 새 글</span>
            </div>
            <p className="mb-2 text-[11px] text-gray-400">마감일 | {p.deadline}</p>
            <h3 className="mb-4 h-12 overflow-hidden text-ellipsis font-bold leading-tight line-clamp-2 group-hover:text-blue-600">
              {p.title}
            </h3>
            <div className="mb-6 flex flex-wrap gap-1">
              {p.roles.map(role => (
                <span key={role} className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-blue-500">{role}</span>
              ))}
            </div>
            <div className="flex items-center justify-between border-t pt-4 text-xs text-gray-500">
              <span className="font-medium text-gray-700">{p.author}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App