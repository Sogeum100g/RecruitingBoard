import { useState, useEffect } from 'react'
import { db } from "./firebase";
import {collection, getDocs } from "firebase/firestore";
import ProjectItem from"./ProjectItem"

function App() {

  // scraper/scraper.py에서 실행한 결과를 가져와서 화면에 전송

  const [projects, setProjects] = useState([]);
  
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
  
  

  return (
    <div className="max-w-5xl mx-auto mt-8 divide-y border-gray-200 rounded-lg overflow-hidden">
      <div class="rounded-xl bg-gradient-to-r from-indigo-900 to-blue-500 p-6 text-white shadow">
        <h1 class="text-2xl font-bold">프로젝트 목록(학생용)</h1>
        <p class="mt-2 text-sm opacity-90">
          현재 모집중인 과제를 확인하고 팀을 구성하세요.
        </p>
      </div>

      {projects.map((project) => (
        // 1. key는 여기서 관리
        // 2. 전체 project 데이터를 'props'로 넘겨줌
        <ProjectItem key={project.id} project={project} />
      ))}
      
    </div>
  )
}

export default App