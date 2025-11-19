'use client';

import { useState, useEffect } from 'react';
import { Mission } from '@/lib/supabase';

type GameStage = 'start' | 'assigned' | 'viewing' | 'completed';

export default function Home() {
  const [stage, setStage] = useState<GameStage>('start');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [missionId, setMissionId] = useState<number | null>(null);
  const [mission, setMission] = useState<Mission | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Load initial game state on page load
  useEffect(() => {
    const loadGameState = async () => {
      try {
        const response = await fetch('/api/game-state');
        const data = await response.json();

        if (data.stage) {
          setStage(data.stage as GameStage);
          setMissionId(data.currentMissionId);

          // If viewing stage, load the mission data
          if (data.stage === 'viewing' && data.currentMissionId) {
            const missionResponse = await fetch('/api/mission/get?id=' + data.currentMissionId);
            const missionData = await missionResponse.json();
            if (missionData.success) {
              setMission(missionData.mission);
            }
          }
        }
      } catch (error) {
        console.error('Error loading game state:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadGameState();
  }, []);

  // Personal mission check modal state
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [personalPassword, setPersonalPassword] = useState('');
  const [personalMissionResult, setPersonalMissionResult] = useState<{
    hasMission: boolean;
    mission?: string;
    message?: string;
  } | null>(null);
  const [personalLoading, setPersonalLoading] = useState(false);
  const [personalError, setPersonalError] = useState('');

  const handleGenerateMission = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/mission/generate', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setMissionId(data.missionId);
        setStage('assigned');
      } else {
        setError(data.error || '미션 생성에 실패했습니다.');
      }
    } catch {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPassword = async () => {
    if (password.length !== 6) {
      setError('비밀번호는 6자리 숫자입니다.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/mission/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password, missionId }),
      });

      const data = await response.json();

      if (data.success) {
        setMission(data.mission);
        setStage('viewing');
      } else {
        setError(data.error || '비밀번호가 올바르지 않습니다.');
      }
    } catch {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      await fetch('/api/mission/reset', { method: 'POST' });
    } catch (error) {
      console.error('Error resetting:', error);
    }
    setStage('start');
    setMissionId(null);
    setMission(null);
    setPassword('');
    setError('');
  };

  const handlePersonClick = (name: string) => {
    if (stage !== 'assigned') return;
    setSelectedPerson(name);
    setPersonalPassword('');
    setPersonalMissionResult(null);
    setPersonalError('');
    setShowPersonalModal(true);
  };

  const handleCheckPersonalMission = async () => {
    if (personalPassword.length !== 4) {
      setPersonalError('비밀번호는 4자리 숫자입니다.');
      return;
    }

    setPersonalLoading(true);
    setPersonalError('');

    try {
      const response = await fetch('/api/mission/check-personal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: selectedPerson, password: personalPassword }),
      });

      const data = await response.json();

      if (data.success) {
        setPersonalMissionResult({
          hasMission: data.hasMission,
          mission: data.mission,
          message: data.message,
        });
      } else {
        setPersonalError(data.error || '확인에 실패했습니다.');
      }
    } catch {
      setPersonalError('서버 오류가 발생했습니다.');
    } finally {
      setPersonalLoading(false);
    }
  };

  const closePersonalModal = () => {
    setShowPersonalModal(false);
    setSelectedPerson(null);
    setPersonalPassword('');
    setPersonalMissionResult(null);
    setPersonalError('');
  };

  // Show loading screen while fetching initial state
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20">
          <h1 className="text-3xl font-bold text-center text-white mb-8">
            🍺 술자리 미션 게임
          </h1>
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20">
        <h1 className="text-3xl font-bold text-center text-white mb-8">
          🍺 술자리 미션 게임
        </h1>

        {/* Stage: Start */}
        {stage === 'start' && (
          <div className="text-center">
            <p className="text-white/80 mb-6">
              버튼을 누르면 9명 중 2명이 선택되고<br />
              각자에게 미션이 주어집니다!
            </p>
            <button
              onClick={handleGenerateMission}
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-lg rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  미션 생성 중...
                </span>
              ) : (
                '🎲 미션 뽑기!'
              )}
            </button>
          </div>
        )}

        {/* Stage: Assigned */}
        {stage === 'assigned' && (
          <div className="text-center">
            <div className="bg-white/20 rounded-xl p-6 mb-6">
              <p className="text-white/60 text-sm mb-2">미션이 생성되었습니다!</p>
              <p className="text-white text-lg mb-2">
                2명이 선택되었습니다
              </p>
              <p className="text-yellow-300 text-sm">
                아래에서 자신의 이름을 클릭하여 미션을 확인하세요
              </p>
            </div>

            <div className="mb-6 p-4 bg-white/10 rounded-xl">
              <p className="text-white/60 text-xs mb-2">관리자 전체 확인</p>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value.replace(/\D/g, ''))}
                placeholder="관리자 비밀번호 6자리"
                className="w-full py-2 px-3 bg-white/20 border border-white/30 rounded-lg text-white text-center text-sm tracking-widest placeholder-white/50 mb-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                onClick={handleVerifyPassword}
                disabled={loading || password.length !== 6}
                className="w-full py-2 px-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold text-sm rounded-lg hover:from-green-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '확인 중...' : '🔐 전체 미션 확인'}
              </button>
            </div>
          </div>
        )}

        {/* Stage: Viewing */}
        {stage === 'viewing' && mission && (
          <div className="text-center">
            <div className="space-y-4 mb-6">
              <div className="bg-pink-500/20 border border-pink-500/30 rounded-xl p-4">
                <p className="text-pink-300 font-bold mb-2">{mission.person1}</p>
                <p className="text-white">{mission.mission1}</p>
              </div>

              <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-4">
                <p className="text-purple-300 font-bold mb-2">{mission.person2}</p>
                <p className="text-white">{mission.mission2}</p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg rounded-xl hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105"
            >
              🔄 초기화하기
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-center text-sm">
            {error}
          </div>
        )}

        {/* Participants List */}
        <div className="mt-8 pt-6 border-t border-white/20">
          <p className="text-white/60 text-xs text-center mb-3">
            {stage === 'assigned' ? '이름을 클릭하여 개인 미션 확인' : '참가자 명단'}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['신국희', '김형진', '노다비', '정진철', '최용선', '지서연', '황차해', '양한목', '김민철'].map((name) => (
              <button
                key={name}
                onClick={() => handlePersonClick(name)}
                disabled={stage !== 'assigned'}
                className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                  stage === 'viewing' && mission && (mission.person1 === name || mission.person2 === name)
                    ? 'bg-pink-500/50 text-white'
                    : stage === 'assigned'
                    ? 'bg-white/20 text-white hover:bg-white/30 cursor-pointer'
                    : 'bg-white/10 text-white/60 cursor-default'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Personal Mission Check Modal */}
      {showPersonalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-purple-800 to-indigo-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-white/20">
            <h2 className="text-xl font-bold text-white text-center mb-4">
              {selectedPerson}님의 미션 확인
            </h2>

            {!personalMissionResult ? (
              <>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={personalPassword}
                  onChange={(e) => setPersonalPassword(e.target.value.replace(/\D/g, ''))}
                  placeholder="개인 비밀번호 4자리"
                  className="w-full py-3 px-4 bg-white/20 border border-white/30 rounded-xl text-white text-center text-xl tracking-widest placeholder-white/50 mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  autoFocus
                />

                {personalError && (
                  <div className="mb-4 p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-center text-sm">
                    {personalError}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={closePersonalModal}
                    className="flex-1 py-3 px-4 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition-all"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleCheckPersonalMission}
                    disabled={personalLoading || personalPassword.length !== 4}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {personalLoading ? '확인 중...' : '확인'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={`p-4 rounded-xl mb-4 ${
                  personalMissionResult.hasMission
                    ? 'bg-green-500/20 border border-green-500/30'
                    : 'bg-gray-500/20 border border-gray-500/30'
                }`}>
                  {personalMissionResult.hasMission ? (
                    <>
                      <p className="text-green-300 font-bold mb-2 text-center">미션이 있습니다!</p>
                      <p className="text-white text-center">{personalMissionResult.mission}</p>
                    </>
                  ) : (
                    <p className="text-gray-300 text-center">{personalMissionResult.message}</p>
                  )}
                </div>

                <button
                  onClick={closePersonalModal}
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  닫기
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
