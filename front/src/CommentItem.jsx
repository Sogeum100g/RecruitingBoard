import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, doc, serverTimestamp, updateDoc, deleteDoc } from "firebase/firestore";


function CommentItem({comment}) {

    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(comment.Content);
    const [inputPassword, setInputPassword] = useState("");

    useEffect(() => {
        setContent(comment.Content);
    }, [comment.Content]);

    // 댓글 수정
    const handleUpdate = async (e) => {

        if (!isEditing) {
            setIsEditing(true);
            return;
        }

        if (inputPassword !== comment.Password) { alert("비밀번호가 틀렸습니다."); return;}  

        if (!content.trim()) return;

        try {
            await updateDoc(doc(db, "comment", comment.id), {
                Content: content,
                Updated: true,
                Created: serverTimestamp(),
            });
            alert("수정되었습니다.");
            setIsEditing(false);
            setContent(comment.Content);
            setInputPassword("");
            
        } catch(error) {
            console.log("Error updating comment : ", error);
        }
    }

    // 수정취소
    const handleCancel = () => {
        setIsEditing(false);
        setContent(comment.Content);
        setInputPassword("");
    }



    // 댓글 삭제
    const handleDelete = async (e) => {
        
        if (inputPassword !== comment.Password) { alert("비밀번호가 틀렸습니다."); return;}  

        try {
            await deleteDoc(doc(db, "comment", comment.id)); 
            alert("삭제되었습니다.");

        } catch(error) {
            console.log("Error Deleting comment : ", error);
        }
    }


    return (
    <div className="flex flex-col border border-gray-300 rounded-sm bg-white mb-4">
        
        {/* 1. 상단 헤더: 작성자와 날짜 */}
        <div className="flex justify-between items-center bg-gray-50 px-3 py-1 border-b border-gray-200">
        <span className="text-blue-700 font-bold text-sm">{comment.Nickname}</span>
        <span className="text-gray-400 text-[10px]">
            {comment.Created?.toDate().toLocaleString()} {comment.Updated? "수정" : ""}
        </span>
        </div>

        {/* 2. 메인 바디: 본문과 관리 버튼 (가로 배치) */}
        <div className="flex min-h-[100px]">
        
            {/* 본문 영역 (왼쪽) */}
            <div className="flex-1 p-3 bg-gray-50 text-sm whitespace-pre-wrap text-gray-800 border-r border-gray-200">
                {isEditing ?
                (<textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key == 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleUpdate();
                        }
                    }}
                    className="w-full h-30 p-2 bg-gray-50 border border-blue-300 rounded-sm focus:outline-none"
                    autoFocus
                />) :(
                <div className="whitespace-pre-wrap text-gray-800">
                    {comment.Content}
                </div>)}
            </div>

            {/* 버튼 및 관리 영역 */}
            <div className="w-32 p-2 flex flex-col gap-2 bg-white items-center justify-start">
                <div className="flex flex-wrap gap-1 justify-center">
                    <button 
                    onClick={handleUpdate}
                    className={`${isEditing ? 'bg-blue-600' : 'bg-gray-600'} text-white px-2 py-1 rounded text-xs font-bold hover:opacity-80`}
                    >
                    {isEditing ? "저장" : "수정"}
                    </button>
                    
                    {isEditing ? (
                    <button 
                        onClick={handleCancel}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold hover:opacity-80"
                    >
                        취소
                    </button>
                    ) : (
                    <button 
                        onClick={handleDelete}
                        className="bg-gray-600 text-white px-2 py-1 rounded text-xs font-bold hover:opacity-80"
                    >
                        삭제
                    </button>
                    )}
                </div>
            
                <input 
                    type="password" 
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    placeholder="비밀번호" 
                    className="w-full border border-gray-400 rounded-md px-2 py-1 text-[10px] outline-none focus:border-blue-500"
                />
            </div>
      </div>
    </div>
    )
}

export default CommentItem