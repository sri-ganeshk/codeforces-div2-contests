import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ContestList.css'; // Import the CSS file for styling

const ContestList = () => {
  const [contests, setContests] = useState([]);
  const [handle, setHandle] = useState('');
  const [userSubmissions, setUserSubmissions] = useState({});

  useEffect(() => {
    fetchContests();
    // Retrieve handle from localStorage when component mounts
    const savedHandle = localStorage.getItem('codeforcesHandle');
    if (savedHandle) {
      setHandle(savedHandle);
      fetchUserSubmissions(savedHandle);
    }
  }, []);

  const fetchContests = async () => {
    const res = await axios.get('https://codeforces.com/api/contest.list');
    const filteredContests = res.data.result.filter(contest => contest.name.includes('Div. 2'));
    setContests(filteredContests.slice(0, 100)); // Limit to 100 contests
  };

  const fetchUserSubmissions = async (handle) => {
    const res = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}`);
    const submissions = res.data.result;

    // Create a dictionary for easy lookup of solved problems
    const solvedProblems = {};
    submissions.forEach(submission => {
      if (submission.verdict === 'OK') {
        const problemKey = `${submission.problem.contestId}-${submission.problem.index}`;
        solvedProblems[problemKey] = true;
      }
    });

    setUserSubmissions(solvedProblems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (handle.trim() === '') return;

    // Save handle to localStorage
    localStorage.setItem('codeforcesHandle', handle);

    // Fetch user submissions
    await fetchUserSubmissions(handle);
  };

  const isProblemSolved = (contestId, problemIndex) => {
    return userSubmissions[`${contestId}-${problemIndex}`];
  };

  return (
    <div className="container">
      <h2>Codeforces Division 2 Contests</h2>
      <form onSubmit={handleSubmit} className="search-form">
        <input 
          type="text" 
          value={handle} 
          onChange={(e) => setHandle(e.target.value)} 
          placeholder="Enter Codeforces Handle" 
          className="input-field"
        />
        <button type="submit" className="submit-button">Submit</button>
      </form>

      <h3>Contest List</h3>
      <table className="contest-table">
        <thead>
          <tr>
            <th>Contest Name</th>
            <th>Problem A</th>
            <th>Problem B</th>
            <th>Problem C</th>
            <th>Problem D</th>
          </tr>
        </thead>
        <tbody>
          {contests.map(contest => (
            <tr key={contest.id}>
              <td>{contest.name}</td>
              <td className={isProblemSolved(contest.id, 'A') ? 'solved' : ''}>
                <a href={`https://codeforces.com/contest/${contest.id}/problem/A`} target="_blank" rel="noreferrer">
                  Problem A
                </a>
              </td>
              <td className={isProblemSolved(contest.id, 'B') ? 'solved' : ''}>
                <a href={`https://codeforces.com/contest/${contest.id}/problem/B`} target="_blank" rel="noreferrer">
                  Problem B
                </a>
              </td>
              <td className={isProblemSolved(contest.id, 'C') ? 'solved' : ''}>
                <a href={`https://codeforces.com/contest/${contest.id}/problem/C`} target="_blank" rel="noreferrer">
                  Problem C
                </a>
              </td>
              <td className={isProblemSolved(contest.id, 'D') ? 'solved' : ''}>
                <a href={`https://codeforces.com/contest/${contest.id}/problem/D`} target="_blank" rel="noreferrer">
                  Problem D
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContestList;
