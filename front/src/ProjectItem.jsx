import { useState, useEffect } from 'react'
import { db } from "./firebase";
import {collection, doc, addDoc, serverTimestamp, query, where, orderBy, onSnapshot, getDocs } from "firebase/firestore";

function ProjectItem({project}) {
    
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");
  const [comments, setComments] = useState([]);

  
  // 등록된 댓글 표시
  useEffect(() => {
    const q = query(
        collection(db, "comment"),
        where("Project_id", "==", doc(db, "project", project.id)),
        orderBy("Created", "desc")
    );

    // 실시간 리스너 연결
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const data = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setComments(data);
    });
    return () => unsubscribe();
  }, [project.id]);



  // 댓글 등록
  const handleSubmit = async (e) => {

    if (e) e.preventDefault();

    if (!nickname || !password || !content) {
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
        Project_id: doc(db, "project", project.id) // 현재 아코디언이 열린 프로젝트의 id
      });
      setContent(""); // 등록 후 입력창 초기화
      alert("등록되었습니다.");
    } catch(error) {
      console.error("Error adding comment : ", error);
    }
  }

  // 댓글 수정
  const handleUpdate = async (e) => {

    const comment_password = await getDocs(collection(db, "comment"), {
        Password: password,
        Project_id: doc(db, "project", project.id)
    });
    
  }

  // 모집 상태 표시
  const statusColor = {
    '모집중': 'bg-green-600',
    '마감': 'bg-gray-400',
    '0팀 신청': 'bg-blue-400 text-white'
  };


    return (
        // 레이아웃 수정: 개별 항목이므로 min-h-screen을 제거해야 리스트가 정상적으로 보입니다.
        <div className='p-2 bg-white rounded-lg border border-gray-100 text-gray-900 text-sm mt-2 shadow-sm'>
            <details className="group">
                <summary className="flex justify-between items-center p-4 cursor-pointer list-none">
                <div>
                    <h3 className="text-sm font-bold text-gray-900">{project.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span>{project.professor}</span>
                        <span className={`px-2 py-0.5 rounded-full ${statusColor[project.status]} text-white`}>{project.status}</span>
                        <span className={`px-2 py-0.5 rounded-full ${statusColor[project.team] ||  "bg-gray-100 text-gray-800 "} `}>{project.team}</span>
                    </div>
                </div>
                    <span className="transition-transform group-open:rotate-180 text-gray-400">
                        <svg fill="none" height="20" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20">
                        <path d="M6 9l6 6 6-6"></path>
                        </svg>
                    </span>
                </summary>

                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    {/* 댓글 입력창 영역 */}
                    <form onSubmit={handleSubmit} className=''>
                        <div className="border border-gray-200 rounded-lg bg-white overflow-hidden mb-4">
                            <div className="flex flex-col md:flex-row">
                                <div className="w-full md:w-40 p-3 bg-gray-50 flex flex-col gap-2 border-r border-gray-200">
                                    <input 
                                    type="text" placeholder="이름" value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    className="w-full border p-1.5 text-xs rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                                    />
                                    <input 
                                    type="password" placeholder="비밀번호" value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full border p-1.5 text-xs rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <textarea 
                                    placeholder="내용을 입력하세요." value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key == 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit();
                                        }
                                    }}
                                    className="flex-1 p-3 text-sm h-24 resize-none focus:outline-none"
                                />
                                
                                <div className="flex justify-end p-2 border-t border-gray-100">
                                    <button 
                                        onClick={() => handleSubmit(project.id)} 
                                        className="bg-gray-700 text-white px-5 py-1.5 rounded text-xs font-bold hover:bg-gray-800"
                                    >
                                        등록
                                    </button>
                                </div>
                            </div>
                            <div className='p-2 flex items-center gap-2 text-xs text-gray-500 mt-1'>                        
                                <p>Shift + Enter : 줄바꿈</p>
                            </div>
                        </div>
                    </form>
                    {/* 실시간 댓글 목록 출력 영역 */}
                    <div className="space-y-3">
                        {comments.map((comment) => (
                        <div key={comment.id} className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-xs text-indigo-700">{comment.Nickname}</span>
                            <span className="text-[10px] text-gray-400">
                                {comment.Created?.toDate().toLocaleString()} {/* Timestamp 변환 */}
                            </span>
                            </div>
                            {/* 전체를 감싸는 컨테이너: 가로 배치(flex) */}
                            <div className="flex border border-gray-300 rounded-sm bg-white overflow-hidden">
                            
                            {/* 1. 왼쪽: 본문 내용 (가변 너비) */}
                            <div className="flex-1 p-3 min-h-[100px] border-r border-gray-300 text-sm whitespace-pre-wrap">
                                {comment.Content}
                            </div>

                            {/* 2. 오른쪽: 버튼 및 입력창 영역 (고정 너비, 위로 정렬) */}
                            <div className="w-32 p-2 flex flex-col gap-2 items-center justify-start"> 
                                {/* justify-start가 버튼들을 '위'로 밀어올립니다 */}
                                
                                <div className="flex gap-1">
                                <button className="bg-gray-600 text-white p-2 rounded text-xs font-bold hover:bg-gray-700">
                                    수정
                                </button>
                                <button className="bg-gray-600 text-white p-2 rounded text-xs font-bold hover:bg-gray-700">
                                    삭제
                                </button>
                                </div>

                                {/* 비밀번호 입력창 (2번 사진 하단 박스) */}
                                <input 
                                type="password" 
                                placeholder="비밀번호" 
                                className="w-full border border-gray-400 rounded-md px-2 py-1 text-xs outline-none"
                                />
                            </div>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
            </details>
        </div>
    )
}

export default ProjectItem