import { useState, useEffect } from 'react'
import { db } from "./firebase";
import {collection, doc, addDoc, serverTimestamp, query, where, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import CommentItem from"./CommentItem"

function ProjectItem({project, handleUpdate, handleDelete}) {
    
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

    if (!nickname || !password || !content || !content.trim()) return;

    try {
      await addDoc(collection(db, "comment"), {
        Nickname: nickname,
        Password: password,
        Content: content,
        Created: serverTimestamp(),
        CommendId: Date.now(),
        Updated: false,
        Project_id: doc(db, "project", project.id) // 현재 아코디언이 열린 프로젝트의 id
      });
      setContent(""); // 등록 후 입력창 초기화
    } catch(error) {
      console.error("Error adding comment : ", error);
    }
  }

  // 모집 상태 표시
  const statusColor = {
    '모집중': 'bg-green-600',
    '마감': 'bg-gray-400',
    '0팀 신청': 'bg-blue-400 text-white'
  };

    return (
        <div className='p-2 bg-white rounded-lg border border-gray-100 text-gray-900 text-sm mt-2 shadow-sm'>
            <details className="group">
                <summary className="flex justify-between items-center p-4 cursor-pointer list-none">
                <div>
                    <h3 className="text-sm font-bold text-gray-900">{project.title} <span className="text-gray-600">[{comments.length}]</span></h3>
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
                                <div className="w-full md:w-40 p-3 bg-gray-100 flex flex-col gap-2 border-r border-gray-200">
                                    <input 
                                    type="text" placeholder="이름" value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    className="w-full border border-gray-300  p-1.5 text-xs rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                                    />
                                    <input 
                                    type="password" placeholder="비밀번호" value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full border border-gray-300  p-1.5 text-xs rounded focus:ring-1 focus:ring-indigo-500 outline-none"
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
                            <div className='p-2 flex bg-gray-100  items-center gap-2 text-xs text-gray-500 '>                        
                                <p>Shift + Enter : 줄바꿈 <br></br> 비밀번호 : 수정/삭제용 비밀번호</p>
                            </div>
                        </div>
                    </form>
                    {/* 실시간 댓글 목록 출력 영역 */}
                    <div className="space-y-3">
                        {comments.map((comment) => (
                        // 1. key는 여기서 관리
                        // 2. 전체 project 데이터를 'props'로 넘겨줌
                        <CommentItem 
                            key={comment.id} 
                            comment={comment} 
                            handleUpdate={handleUpdate} 
                            handleDelete={handleDelete}                            
                        />
                        ))}
                    </div>
                </div>
            </details>
        </div>
    )
}

export default ProjectItem