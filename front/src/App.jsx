import { useState, useEffect } from 'react'
import { db } from "./firebase";
import {collection, doc, getDocs, addDoc, serverTimestamp} from "firebase/firestore";

function App() {
  // 나중에 Appwrite에서 가져올 데이터를 미리 상상해봅시다.

  // scraper/scraper.py에서 실행한 결과를 가져와서 화면에 뿌린다.
  // results : 38개의 json 객체를 담은 배열
  const [projects, setProjects] = useState([]);
  const [nickname, setNickname] = useState([]);
  const [password, setPassword] = useState([]);
  const [content, setContent] = useState([]);
  
  // 프로젝트 정보 추출
  useEffect(() => {
    const fetchData = async() => {
      try{
        const querySnapshot = await getDocs(collection(db, "project"));
        // 데이터 매핑
        const data = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        setProjects(data);
      } catch(e) {
        console.error("Error fetching data : ", e);
      }
    };
    fetchData();
  }, []);
  
  // 댓글 등록
  const handleSubmit = async (projectId) => {
    
    if (!nickname || !content) {
      alert("내용을 입력해주세요.");
      return;
    }

    try {
      await addDoc(collection(db, "comment"), {
        Nickname: nickname,
        Password: password,
        Content: content,
        Created: serverTimestamp(),
        CommendId: Date.now(),
        Project_id: doc(db, "project", projectId) // 현재 아코디언이 열린 프로젝트의 id
      });
      setContent(""); // 등록 후 입력창 초기화
      alert("등록되었습니다.");
    } catch(error) {
      console.error("Error adding comment : ", error);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-10">
      <div>
        안녕하세요
      </div>
      <div>
        <h2>프로젝트 목록(학생용)</h2>
      </div>
      <div className="grid divide-y divide-neutral-200 ">
        {projects.map(project => (
          <div className='p-2 bg-white rounded-lg border border-gray-1000 text-gray-900 text-sm font-medium-5 mt-2'>
            <div key={project.id} className=''>
              {/* 1. details 태그에 group 클래스를 부여하여 내부 요소 제어 */}
              <details className="group">
                {/* 2. summary는 항상 보이는 헤더 영역입니다. */}
                <summary className="justify-between items-center font-medium cursor-pointer list-none">
                  {/* 프로젝트 번호, 제목 */}
                  <h3 className="text-sm font-bold text-gray-900 leading-tight">{project.title}</h3>
                  {/* 메타 정보 */}
                  <div className="flex items-center flex-wrap gap-2 text-sm text-gray-500 mt-2">
                    <span> {project.professor}</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white"> {project.status}</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"> {project.team}</span>
                  </div>
                  {/* 오른쪽: 화살표 아이콘 및 애니메이션 */}
                  <span className="transition-transform duration-300 group-open:rotate-180 text-gray-400">
                    <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24">
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </span>
                </summary>

                {/* 3. 펼쳐졌을 때만 보이는 댓글(아코디언 내용) 영역 */}
                <div className="mt-4 border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
                  <div className="flex flex-col md:flex-row">
                    {/* 1. 왼쪽 입력 영역: 닉네임 및 비밀번호 */}
                    <div className="w-full md:w-40 p-3 bg-gray-50 flex flex-col gap-2 border-b md:border-b-0 md:border-r border-gray-200">
                      <input 
                        type="text" 
                        placeholder="이름" 
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <input 
                        type="password" 
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} 
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* 2. 중앙 입력 영역: 댓글 본문 */}
                    <div className="flex-1">
                      <textarea 
                        placeholder="내용을 입력하세요."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-24 md:h-full p-3 text-sm focus:outline-none resize-none placeholder:text-gray-400"
                      ></textarea>
                    </div>
                  </div>

                  {/* 3. 하단 영역: 안내 문구 및 등록 버튼 */}
                  <div className="flex justify-between items-center px-4 py-2 border-t border-gray-100 bg-white">
                    <span className="text-[11px] text-gray-400 hidden sm:inline">
                      Shift+Enter 키를 누르면 줄바꿈이 됩니다.
                    </span>
                    <button 
                      onClick={() => handleSubmit(project.id)}
                      className="ml-auto bg-indigo-600 text-white px-5 py-1.5 rounded text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm">
                      등록
                    </button>
                  </div>
                </div>
              </details>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}



export default App